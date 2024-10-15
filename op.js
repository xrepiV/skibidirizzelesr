Function("(" + (() => {
    var __webpack_module_cache__ = {};
    function __webpack_require__(moduleId) {
        var cachedModule = __webpack_module_cache__[moduleId];
        if (cachedModule !== undefined) {
            return cachedModule.exports;
        }
        var module = __webpack_module_cache__[moduleId] = {
            exports: {}
        };
        return module.exports;
    }
    (() => {
        __webpack_require__.d = (exports, definition) => {
            for (var key in definition) {
                if (__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
                    Object.defineProperty(exports, key, {
                        enumerable: true,
                        get: definition[key]
                    });
                }
            }
        };
    })();
    (() => {
        __webpack_require__.o = (obj, prop) => Object.prototype.hasOwnProperty.call(obj, prop);
    })();
    var __webpack_exports__ = {};


    (() => {
        const TYPEOF = value => Object.prototype.toString.call(value).slice(8, -1).toLowerCase();
        const NumberSystem = [{
            radix: 2,
            prefix: "0b0*"
        }, {
            radix: 8,
            prefix: "0+"
        }, {
            radix: 10,
            prefix: ""
        }, {
            radix: 16,
            prefix: "0x0*"
        }];
        class Regex {
            constructor(code, unicode) {
                this.code = code;
                this.COPY_CODE = code;
                this.unicode = unicode || false;
                this.hooks = {};
            }
            static parseValue(value) {
                try {
                    return Function(`return (${value})`)();
                } catch (err) {
                    return null;
                }
            }
            isRegexp(value) {
                return TYPEOF(value) === "regexp";
            }
            generateNumberSystem(int) {
                const copy = [ ...NumberSystem ];
                const template = copy.map((({prefix, radix}) => prefix + int.toString(radix)));
                return `(?:${template.join("|")})`;
            }
            parseVariables(regex) {
                regex = regex.replace(/\{VAR\}/g, "(?:let|var|const)");
                regex = regex.replace(/\{QUOTE\}/g, "['\"`]");
                regex = regex.replace(/ARGS\{(\d+)\}/g, ((...args) => {
                    let count = Number(args[1]), arr = [];
                    while (count--) arr.push("\\w+");
                    return arr.join("\\s*,\\s*");
                }));
                regex = regex.replace(/NUMBER\{(\d+)\}/g, ((...args) => {
                    const int = Number(args[1]);
                    return this.generateNumberSystem(int);
                }));
                return regex;
            }
            format(name, inputRegex, flags) {
                this.totalHooks += 1;
                let regex = "";
                if (Array.isArray(inputRegex)) {
                    regex = inputRegex.map((exp => this.isRegexp(exp) ? exp.source : exp)).join("\\s*");
                } else if (this.isRegexp(inputRegex)) {
                    regex = inputRegex.source;
                }
                regex = this.parseVariables(regex);
                if (this.unicode) {
                    regex = regex.replace(/\\w/g, "(?:[^\\x00-\\x7F-]|\\$|\\w)");
                }
                const expression = new RegExp(regex.replace(/\{INSERT\}/, ""), flags);
                const match = this.code.match(expression);
                return regex.includes("{INSERT}") ? new RegExp(regex, flags) : expression;
            }
            template(type, name, regex, substr) {
                const expression = new RegExp(`(${this.format(name, regex).source})`);
                const match = this.code.match(expression) || [];
                this.code = this.code.replace(expression, type === 0 ? "$1" + substr : substr + "$1");
                return match;
            }
            match(name, regex, flags, debug = false) {
                const expression = this.format(name, regex, flags);
                const match = this.code.match(expression) || [];
                this.hooks[name] = {
                    expression,
                    match
                };
                return match;
            }
            matchAll(name, regex, debug = false) {
                const expression = this.format(name, regex, "g");
                const matches = [ ...this.code.matchAll(expression) ];
                this.hooks[name] = {
                    expression,
                    match: matches
                };
                return matches;
            }
            replace(name, regex, substr, flags) {
                const expression = this.format(name, regex, flags);
                console.log(`replace: ${expression} // ${JSON.stringify(substr)}`);
                this.code = this.code.replace(expression, substr);
                return this.code.match(expression) || [];
            }
            append(name, regex, substr) {
                return this.template(0, name, regex, substr);
            }
        }
        const applyHooks = code => {
            const Hook = new Regex(code, true);
            window.COPY_CODE = (Hook.COPY_CODE.match(/^(\(function \w+\(\w+\)\{.+)\(.+?\);$/) || [])[1];
            Hook.append("Bundle hooks online", /\(function (\w+)\(\w+\)\{/, "let $2 = eval(`(() => ${COPY_CODE})()`);delete window.COPY_CODE;window.working=1;");

            Hook.append("hideHUD", /==\w+}function \w+\(\w,\w\){/, `if (window.HUD) return;`);
          return Hook.code;
        };
        window.eval = new Proxy(window.eval, {
            apply(target, _this, args) {
                const code = args[0];
                if (code.length > 1e5) {
                    args[0] = applyHooks(code);
                    window.eval = target;
                    target.apply(_this, args);
                    return;
                }
                return target.apply(_this, args);
            }
        });
    })();
}).toString() + ")()")();
