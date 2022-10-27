use serde::{Deserialize, Serialize};
use std::{fs, path::PathBuf};
use swc_ecma_visit::Fold;
use swc_plugin::{ast::*, plugin_transform, syntax_pos::DUMMY_SP, TransformPluginProgramMetadata};

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Config {
    pub root_dir: Option<String>,
}

/// Additional context for the plugin.
#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Context {
    /// The name of the current file.
    #[serde(default)]
    pub filename: Option<String>,
}
pub struct RawMacro {
    local_sym: String,
    root: PathBuf,
    cwd: PathBuf,
}

impl RawMacro {
    pub fn new(root_dir: String, current_path: String) -> Self {
        let mut cwd: PathBuf = PathBuf::from("/cwd");
        let current = current_path.replace(&root_dir, "");

        // remove first / character
        let mut paths = current.chars();
        paths.next();

        // current_path always refer to file, use pop to get cwd
        cwd = cwd.join(PathBuf::from(paths.as_str()));
        cwd.pop();

        RawMacro {
            local_sym: String::new(),
            root: PathBuf::from("/cwd"),
            cwd,
        }
    }

    fn read_file(&mut self, raw_path: String) -> String {
        let is_relative = raw_path.chars().nth(0).unwrap() == '.';
        let path = if is_relative {
            self.cwd.join(PathBuf::from(raw_path))
        } else {
            self.root
                .join(PathBuf::from("./node_modules/"))
                .join(raw_path)
        };

        match fs::read_to_string(&path) {
            Ok(s) => s,
            Err(err) => format!("Failed to read {}\nError: {}", &path.to_str().unwrap(), err),
        }
    }

    // generate string literal expr
    fn replace_with_literal_from(&mut self, raw_path: String) -> Expr {
        Expr::Lit(Lit::Str(Str {
            span: DUMMY_SP,
            value: self.read_file(raw_path).into(),
            raw: None,
        }))
    }
}

// https://rustdoc.swc.rs/swc_ecma_visit/trait.VisitMut.html
impl Fold for RawMacro {
    // get imported identifier
    fn fold_import_decl(&mut self, import: ImportDecl) -> ImportDecl {
        let import = import.fold_children_with(self);

        if &import.src.value == "raw.macro" {
            for s in &import.specifiers {
                match &s {
                    ImportSpecifier::Default(sp) => self.local_sym = String::from(&*sp.local.sym),
                    _ => {}
                }
            }
        }

        import
    }

    // remove raw.macro import statement
    fn fold_module_items(&mut self, mods: Vec<ModuleItem>) -> Vec<ModuleItem> {
        let mut mods: Vec<ModuleItem> = mods.fold_children_with(self);

        mods.retain(|m| match &m {
            ModuleItem::ModuleDecl(ModuleDecl::Import(ImportDecl {src, ..})) =>  &src.value != "raw.macro",
            _ => true,
        });
        mods
    }

    // replace call expr with string literal
    // use fold_expr because we want to return different expr
    fn fold_expr(&mut self, expr: Expr) -> Expr {
        let expr = expr.fold_children_with(self);

        match &expr {
            Expr::Call(CallExpr { args, callee: Callee::Expr(cex), ..}) => 
                // in the feature stable of rust boxed, wee can use 
                // match someBox { box Expr::Ident(i) => ... }
                match &**cex {
                    Expr::Ident(i) => 
                        if &*i.sym == self.local_sym {
                            let raw_path = match args[0].expr.as_lit() {
                                Some(lit) => match lit {
                                    Lit::Str(str) => String::from(&*str.value),
                                    _ => panic!("raw.macro expects string as first argument"),
                                },
                                _ => panic!("raw.macro expects one argument"),
                            };

                            self.replace_with_literal_from(raw_path)
                        } else {
                            expr
                        }
                    _ => expr,
                },
            _ => expr,
        }
    }
}

#[plugin_transform]
pub fn process_transform(program: Program, metadata: TransformPluginProgramMetadata) -> Program {
    let config: Config =
        serde_json::from_str(&metadata.plugin_config).expect("Should provide plugin config");

    let context: Context =
        serde_json::from_str(&metadata.transform_context).expect("failed to parse plugin context");

    let root_dir = config
        .root_dir
        .expect("Should provide `rootDir` in plugin config");
    let current_path = context.filename.unwrap();
    program.fold_with(&mut RawMacro::new(root_dir, current_path))
}
