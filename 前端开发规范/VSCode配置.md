## 以下为 React 项目开发的基本配置，将下面的 JSON 导入到 VSCODE 的配置文件，覆盖即可

```javascript
{

    "workbench.iconTheme": "vscode-icons",

    "editor.fontSize": 16,

    "explorer.confirmDragAndDrop": false,

    "explorer.confirmDelete": false,

    "git.enableSmartCommit": true,

    "git.confirmSync": false,

    "git.autofetch": true,

    "editor.tabSize": 2,

    "window.zoomLevel": 0,

    "javascript.validate.enable": true,

    "editor.formatOnSave": true,

    "javascript.format.enable": false,

    "files.associations": {

        "*.js": "javascriptreact"

    },

    "prettier.singleQuote": true,

    "files.exclude": {

        "**/.git": true,

        "**/.svn": true,

        "**/.hg": true,

        "**/CVS": true,

        "**/.DS_Store": true,

        "*/.js": {

            "when": "$(basename).ts"

        },

        "*/.js.map": true,

        "*/.css": {

            "when": "$(basename).scss"

        }

    },

    "vsicons.dontShowNewVersionMessage": true,

    "extensions.ignoreRecommendations": true,

    "javascript.updateImportsOnFileMove.enabled": "always",
    "prettier.eslintIntegration": true,
    "javascript.implicitProjectConfig.experimentalDecorators": true,
}
```
