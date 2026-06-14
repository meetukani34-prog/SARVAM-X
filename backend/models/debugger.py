"""
Autonomous Code Debugger
Detects syntax, runtime, and logical errors in Python code.
"""
import ast
import re
import io
import sys
import textwrap


class CodeDebugger:
    def __init__(self):
        self.error_patterns = {
            'python': [
                (r'/ 0(?!\.)(?!\d)', 'ZeroDivisionError', 'CRITICAL', 'Division by literal zero detected. Use a safe divisor with a fallback: `value / (divisor or 1)`'),
                (r'while\s+True\s*:', 'InfiniteLoop', 'WARNING', 'Infinite loop detected. Ensure a break/return condition is reachable.'),
                (r'except\s*:', 'BareExcept', 'WARNING', 'Bare except catches all exceptions including SystemExit. Use `except Exception as e:` instead.'),
                (r'eval\s*\(', 'SecurityRisk', 'WARNING', '`eval()` executes arbitrary code.'),
                (r'import \*', 'StarImport', 'INFO', 'Wildcard imports pollute namespace.'),
            ],
            'javascript': [
                (r'==\s*null', 'LooseEquality', 'WARNING', 'Use `=== null` for strict equality check.'),
                (r'var\s+', 'VarUsage', 'INFO', 'Use `let` or `const` instead of `var` (ES6+).'),
                (r'console\.log', 'DebugLog', 'INFO', 'Remove console logs before production.'),
                (r'eval\s*\(', 'SecurityRisk', 'CRITICAL', '`eval()` in JS is a major security risk.'),
            ],
            'cpp': [
                (r'gets\s*\(', 'DeprecatedFunction', 'CRITICAL', '`gets()` is unsafe and removed in C++11. Use `fgets()` or `std::cin`.'),
                (r'malloc\s*\(', 'LegacyAllocation', 'INFO', 'Use `new` operator in C++ for better type safety.'),
                (r'using\s+namespace\s+std;', 'NamespacePollution', 'WARNING', 'Avoid `using namespace std;` in headers.'),
            ],
            'java': [
                (r'==\s*".*?"', 'StringComparison', 'WARNING', 'Use `.equals()` for string comparison in Java.'),
                (r'System\.out\.print', 'DebugPrint', 'INFO', 'Use a proper logging framework like Log4j or SLF4J.'),
            ],
            'c': [
                (r'gets\s*\(', 'SecurityRisk', 'CRITICAL', '`gets()` is highly unsafe. Use `fgets()` instead.'),
                (r'scanf\s*\(\s*".*?%s', 'BufferOverflow', 'WARNING', '`scanf` with `%s` lacks boundary check. Use width specifier or `fgets`.'),
                (r'malloc\s*\(', 'MemoryManagement', 'INFO', 'Ensure every `malloc` has a corresponding `free` to avoid leaks.'),
            ],
            'php': [
                (r'include\s*\(', 'SecurityRisk', 'WARNING', 'Use `require_once` for critical dependencies to avoid partial loads.'),
                (r'\$GLOBALS', 'GlobalState', 'INFO', 'Avoid using $GLOBALS; use dependency injection instead.'),
            ],
            'csharp': [
                (r'catch\s*\{\}', 'EmptyCatch', 'WARNING', 'Avoid empty catch blocks. Log the exception at least.'),
                (r'goto\s+', 'GotoUsage', 'WARNING', 'Avoid `goto` statements for cleaner control flow.'),
            ],
            'ruby': [
                (r'@@\w+', 'ClassVariable', 'INFO', 'Class variables (@@) are shared across inheritance. Use class-instance variables (@) instead.'),
                (r'eval\s*\(', 'SecurityRisk', 'CRITICAL', '`eval` in Ruby can execute arbitrary code.'),
            ],
            'rust': [
                (r'unwrap\s*\(', 'PanicRisk', 'WARNING', '`unwrap()` can panic. Use `expect()` or handle the Result/Option.'),
                (r'unsafe\s*\{', 'UnsafeBlock', 'INFO', 'Manual memory management detected. Ensure safety invariants are upheld.'),
            ],
            'go': [
                (r'panic\s*\(', 'PanicUsage', 'WARNING', 'Use error returning instead of `panic()` for normal error handling.'),
                (r'defer\s+.*\.Close\(\)', 'DeferClose', 'INFO', 'Ensure error check is done before deferring Close().'),
            ],
            'swift': [
                (r'!\s*$', 'ForcedUnwrapping', 'WARNING', 'Forced unwrapping (!) can cause runtime crashes. Use `if let` or `guard let`.'),
                (r'print\s*\(', 'DebugPrint', 'INFO', 'Remove print statements for production performance.'),
            ]
        }

    def analyze(self, code: str, language: str = 'python') -> dict:
        if len(code) > 10000:
            return {
                "errors": [{"type": "InputTooLarge", "line": 0, "severity": "CRITICAL", "message": "Code exceeds 10,000 characters."}],
                "fixes": [], "complexity": 100, "efficiency": 0, "lines_analyzed": 0, "error_count": 1
            }
            
        errors = []
        fixes = []
        lines = code.split('\n')
        
        if len(lines) > 500:
            return {
                "errors": [{"type": "TooManyLines", "line": 0, "severity": "CRITICAL", "message": "Code exceeds 500 lines."}],
                "fixes": [], "complexity": 100, "efficiency": 0, "lines_analyzed": 0, "error_count": 1
            }

        # 1. Syntax analysis via AST (Python only)
        syntax_error = None
        if language == 'python':
            syntax_error = self._check_syntax(code)
            if syntax_error:
                errors.append(syntax_error)
                fixes.append({
                    "line": syntax_error.get("line", 1),
                    "type": "SyntaxError",
                    "suggestion": syntax_error.get("message", "Fix the syntax error above.")
                })

        # 2. Pattern-based error detection
        patterns = self.error_patterns.get(language, [])
        for i, line in enumerate(lines, 1):
            if len(line) > 500: continue # Skip ultra-long lines to avoid ReDoS
            for pattern, etype, severity, suggestion in patterns:
                if re.search(pattern, line):
                    err = {
                        "type": etype,
                        "line": i,
                        "severity": severity,
                        "message": f"{etype} detected: {line.strip()[:60]}",
                        "code_snippet": line.strip()
                    }
                    errors.append(err)
                    fix = self._generate_fix(line, etype, i)
                    if fix:
                        fixes.append(fix)

        # 3. AST-based logical checks (Python only)
        if language == 'python' and not syntax_error:
            ast_errors, ast_fixes = self._ast_analyze(code)
            errors.extend(ast_errors)
            fixes.extend(ast_fixes)

        # 4. Complexity analysis
        complexity = self._estimate_complexity(code)
        efficiency = self._calc_efficiency(code, len(errors))

        return {
            "errors": errors,
            "fixes": fixes,
            "complexity": complexity,
            "efficiency": efficiency,
            "lines_analyzed": len(lines),
            "error_count": len(errors)
        }

    def _check_syntax(self, code: str):
        try:
            ast.parse(code)
            return None
        except SyntaxError as e:
            return {
                "type": "SyntaxError",
                "line": e.lineno or 1,
                "severity": "CRITICAL",
                "message": str(e.msg),
                "code_snippet": e.text.strip() if e.text else ""
            }

    def _generate_fix(self, line: str, etype: str, lineno: int) -> dict:
        fixes = {
            'ZeroDivisionError': {
                "line": lineno,
                "type": "ZeroDivisionError",
                "original": line.strip(),
                "fixed": re.sub(r'/ 0(?!\.)(?!\d)', '/ (divisor or 1)', line.strip()),
                "explanation": "Replaced hardcoded `/ 0` with a safe fallback `/ (divisor or 1)` to prevent ZeroDivisionError at runtime."
            },
            'InfiniteLoop': {
                "line": lineno,
                "type": "InfiniteLoop",
                "original": line.strip(),
                "fixed": line.strip() + "\n    # TODO: Add break/return condition",
                "explanation": "Added a reminder to insert a break or return condition to avoid an infinite loop."
            },
            'BareExcept': {
                "line": lineno,
                "type": "BareExcept",
                "original": line.strip(),
                "fixed": line.strip().replace('except:', 'except Exception as e:'),
                "explanation": "Replaced bare `except:` with `except Exception as e:` for safer error handling."
            },
        }
        return fixes.get(etype)

    def _ast_analyze(self, code: str):
        errors, fixes = [], []
        try:
            tree = ast.parse(code)
        except Exception:
            return errors, fixes

        for node in ast.walk(tree):
            # Detect mutable default arguments
            if isinstance(node, ast.FunctionDef):
                for default in node.args.defaults:
                    if isinstance(default, (ast.List, ast.Dict, ast.Set)):
                        errors.append({
                            "type": "MutableDefault",
                            "line": node.lineno,
                            "severity": "WARNING",
                            "message": f"Function `{node.name}` uses a mutable default argument (list/dict/set). This is shared across calls.",
                            "code_snippet": f"def {node.name}(...)"
                        })
                        fixes.append({
                            "line": node.lineno,
                            "type": "MutableDefault",
                            "original": f"def {node.name}(arg=[]):",
                            "fixed": f"def {node.name}(arg=None):\n    if arg is None: arg = []",
                            "explanation": "Use `None` as default and initialize inside the function body to avoid shared mutable state."
                        })

            # Detect == None instead of is None
            if isinstance(node, ast.Compare):
                for op, comp in zip(node.ops, node.comparators):
                    if isinstance(op, ast.Eq) and isinstance(comp, ast.Constant) and comp.value is None:
                        errors.append({
                            "type": "NoneComparison",
                            "line": node.lineno,
                            "severity": "INFO",
                            "message": "Use `is None` instead of `== None` (PEP 8).",
                            "code_snippet": "... == None"
                        })

        # Detect undefined variables
        import builtins
        defined_names = set(dir(builtins))
        for node in ast.walk(tree):
            if isinstance(node, ast.Assign):
                for target in node.targets:
                    if isinstance(target, ast.Name):
                        defined_names.add(target.id)
            elif isinstance(node, ast.FunctionDef):
                defined_names.add(node.name)
                for arg in node.args.args:
                    defined_names.add(arg.arg)
            elif isinstance(node, ast.ClassDef):
                defined_names.add(node.name)
            elif isinstance(node, ast.Import):
                for alias in node.names:
                    defined_names.add(alias.asname or alias.name)
            elif isinstance(node, ast.ImportFrom):
                for alias in node.names:
                    defined_names.add(alias.asname or alias.name)
            elif isinstance(node, ast.arg):
                defined_names.add(node.arg)

        for node in ast.walk(tree):
            if isinstance(node, ast.Name) and isinstance(node.ctx, ast.Load):
                if node.id not in defined_names:
                    errors.append({
                        "type": "NameError",
                        "line": getattr(node, 'lineno', 1),
                        "severity": "CRITICAL",
                        "message": f"Name '{node.id}' is not defined.",
                        "code_snippet": f"{node.id}"
                    })
                    fixes.append({
                        "line": getattr(node, 'lineno', 1),
                        "type": "NameError",
                        "original": node.id,
                        "fixed": f'"{node.id}"',
                        "explanation": f"If '{node.id}' is meant to be a string, enclose it in quotes. Otherwise, ensure it is defined before use."
                    })
                    # Add it to defined names so we only error once per variable
                    defined_names.add(node.id)

        return errors, fixes

    def _estimate_complexity(self, code: str) -> str:
        """Estimate Big-O complexity by counting nested loops in AST."""
        try:
            tree = ast.parse(code)
        except Exception:
            return "O(?)"

        max_depth = self._max_loop_depth(tree, 0)

        if max_depth == 0:
            return "O(1)"
        elif max_depth == 1:
            return "O(n)"
        elif max_depth == 2:
            return "O(n²)"
        elif max_depth == 3:
            return "O(n³)"
        else:
            return f"O(n^{max_depth})"

    def _max_loop_depth(self, node, depth) -> int:
        """Recursively find maximum nesting depth of loops."""
        max_d = depth
        children = list(ast.iter_child_nodes(node))
        for child in children:
            if isinstance(child, (ast.For, ast.While)):
                d = self._max_loop_depth(child, depth + 1)
            else:
                d = self._max_loop_depth(child, depth)
            max_d = max(max_d, d)
        return max_d

    def _calc_efficiency(self, code: str, error_count: int) -> float:
        """Score code efficiency 0-100."""
        base = 90
        # Penalize for errors
        base -= error_count * 8
        # Penalize for very long functions (no modularization)
        lines = [l for l in code.split('\n') if l.strip()]
        if len(lines) > 50:
            base -= 5
        # Penalize for nested loops
        try:
            tree = ast.parse(code)
            depth = self._max_loop_depth(tree, 0)
            base -= max(0, (depth - 1) * 10)
        except Exception:
            pass
        return max(0, min(100, round(base, 1)))
