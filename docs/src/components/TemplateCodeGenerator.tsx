import React, { useEffect, useMemo, useState } from "react";
import CodeBlock from "@theme/CodeBlock";
import styles from "./TemplateCodeGenerator.module.css";

const VAR_RE = /\{\{\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*\}\}/g;

function detectIpVersion(ip: string): "ipv4" | "ipv6" | "unknown" {
	const s = (ip ?? "").trim();
	if (!s) return "unknown";
	if (/^\d{1,3}(\.\d{1,3}){3}$/.test(s)) return "ipv4";
	if (/^[0-9a-fA-F:]+$/.test(s) && s.includes(":")) return "ipv6";
	return "unknown";
}

function computeDerived(vars: Record<string, string>): Record<string, string> {
	const ip = (vars.ip ?? "").trim();
	const port = (vars.port ?? "").trim();
	const ipType = detectIpVersion(ip);

	let target = "";
	if (ip && port) {
		target = ipType === "ipv6" ? `[${ip}]:${port}` : `${ip}:${port}`;
	} else if (ip) {
		target = ipType === "ipv6" ? `[${ip}]` : ip;
	}
	return { target, ip_type: ipType };
}

function uniqueInOrder(arr: string[]): string[] {
	const seen = new Set<string>();
	const out: string[] = [];
	for (const x of arr) if (!seen.has(x)) (seen.add(x), out.push(x));
	return out;
}

type Props = {
	title?: string;
	language?: string;

	initialTemplate?: string;

	children?: string;

	initialVars?: Record<string, string>;
	allowEditTemplate?: boolean;
	missingBehavior?: "empty" | "keep";
};

export default function TemplateCodeGenerator({
	title = "",
	language = "bash",
	initialTemplate,
	children,
	initialVars = {},
	allowEditTemplate = false,
	missingBehavior = "keep",
}: Props) {
	const seedTemplate = (typeof children === "string" && children.length > 0)
		? children : (initialTemplate ?? "");
	
	const [template, setTemplate] = useState(seedTemplate);
	const [vars, setVars] = useState<Record<string, string>>(initialVars);

	useEffect(() => {
		setTemplate(seedTemplate);
	}, [seedTemplate]);

	const varNames = useMemo(() => {
		const names: string[] = [];
		let m: RegExpExecArray | null;
		while ((m = VAR_RE.exec(template)) !== null) names.push(m[1]);
		VAR_RE.lastIndex = 0;
		return uniqueInOrder(names);
	}, [template]);

	useEffect(() => {
		setVars((prev) => {
			const next = { ...prev };
			for (const name of varNames) if (next[name] === undefined) next[name] = "";
			return next;
		});
	}, [varNames]);

	const derived = useMemo(() => computeDerived(vars), [vars]);

	const rendered = useMemo(() => {
		const all = { ...vars, ...derived };
		return template.replace(VAR_RE, (_, name: string) => {
			const v = all[name];
			if (v === undefined || v === null || v === "") {
				return missingBehavior === "empty" ? "" : `{{${name}}}`;
			}
			return String(v);
		});
	}, [template, vars, derived, missingBehavior]);

	return (
		<div className={styles.wrapper}>
			<div className={styles.header}>

				{varNames.length > 0 && (
					<div className={styles.card}>
						<div>
							<div className={styles.sectionTitle}></div>
							<div className={styles.help}>
								{title}
							</div>
						</div>

						<div className={styles.grid}>
							{varNames.map((name) => {
								const isDerived = Object.prototype.hasOwnProperty.call(derived, name);
								if (isDerived) return null;

								return (
									<label key={name} className={`${styles.label} ${styles.col6}`}>
										<div className={styles.labelTop}>
											<span className={styles.labelName}>{name}</span>
										</div>

										<input value={vars[name] ?? ""}
											onChange={(e) =>
												setVars((prev) => ({...prev, [name]: e.target.value }))
											}
											placeholder={`${name}`}
											className={styles.input}
										/>
									</label>
								);
							})}
						</div>
					</div>
				)}
			</div>
			<CodeBlock language={language}>{rendered}</CodeBlock>
		</div>
	);
}
