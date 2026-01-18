import React, { useEffect, useMemo, useState } from 'react';
import CodeBlock from '@theme/CodeBlock';
import styles from './TemplateCodeGenerator.module.css';

const VAR_RE = /\{\{\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*\}\}/g;

type Props = {
    title?: string;
    language?: string;

    template?: string;
    children?: string;
};

export default function GeneratePoolCertCode({
    title = "Generate Pool Certificate",
    language = "bash",
    children = "",
}: Props) {
    const seedTemplate = (typeof children === "string" && children.length > 0)
        ? children : ""
    
    const [template, setTemplate] = useState(seedTemplate);
    const [pledge, setPledge] = useState("100");
    const [cost, setCost] = useState("170");
    const [margin, setMargin] = useState("5");
    const [relayIp, setRelayIp] = useState("");
    const [relayPort, setRelayPort] = useState("");
    const [metaUrl, setMetaUrl] = useState("");
    const [vars, setVars] = useState<Record<string, string>>({
        'PLEDGE': '100',
        'COST': '170',
        'MARGIN': '5',
    });

    useEffect(() => {
        setTemplate(seedTemplate);
    }, [seedTemplate]);
    
    const rendered = useMemo(() => {
        const all = {
            ...vars,
            'PLEDGE': pledge,
            'COST': cost,
            'MARGIN': margin,
            'RELAY_IP': relayIp,
            'RELAY_PORT': relayPort,
            'META_URL': metaUrl,
        };
        return template.replace(VAR_RE, (_, name: string) => {
            let v = all[name];
            if (name == "PLEDGE") {
                if (v === undefined || v === null || v === "") {
                    v = "";
                } else{
                    const pledge = Number(all['PLEDGE'] || "");
                    v = String(pledge * 1000000);
                }
            }
            if (name == "COST") {
                if (v === undefined || v === null || v === "") {
                    v = "";
                } else {
                    const cost = Number(all['COST'] || "");
                    v = String(cost * 1000000);
                }
            }
            if (name == "MARGIN") {
                if (v === undefined || v === null || v === "") {
                    v = "";
                } else {
                    const margin = Number(all['MARGIN'] || "");
                    v = String(margin / 100);
                }
            }
            if (name == "RELAY_IP") {
                if (v === undefined || v === null || v === "") {
                    v = "0.0.0.0";
                }
                v = String(v);
            }
            if (name == "RELAY_PORT") {
                if (v === undefined || v === null || v === "") {
                    v = "6000";
                }
                v = String(v);
            }
            if (name == "META_URL") {
                if (v === undefined || v === null || v === "") {
                    v = "https://example.com/poolMetaData.json";
                }
                v = String(v);
            }
            if (v === undefined || v === null) {
            }
            return String(v);
        });
    }, [seedTemplate, vars, pledge, cost, margin, relayIp, relayPort, metaUrl]);

    return (
        <div className={styles.wrapper}>
            <div className={styles.header}>
                <div className={styles.card}>
                    <div>
                        <div className={styles.help}>
                            {title}
                        </div>
                    </div>
                    <div className={styles.wrapper}>
                        <div className={styles.grid}>
                            <label key="PLEDGE" className={`${styles.label} ${styles.col6}`}>
                                <div className={`${styles.label}`}>
                                    <span className={styles.labelName}>誓約</span>
                                </div>
                                <input value={pledge}
                                    onChange={(e) => {
                                        const value = e.target.value.trim();
                                        if (value.length === 0) {
                                            setPledge(value);
                                            return;
                                        }
                                        const val = Number(value);
                                        if (isNaN(val) || val <= 0) return;
                                        setPledge(val.toFixed(0));
                                    }}
                                    placeholder="100"
                                    className={styles.input} />
                            </label>
                            <label key="COST" className={`${styles.label} ${styles.col6}`}>
                                <div className={`${styles.label}`}>
                                    <span className={styles.labelName}>固定手数料</span>
                                </div>
                                <input value={cost}
                                    onChange={(e) => {
                                        const value = e.target.value.trim();
                                        if (value.length === 0) {
                                            setCost(value);
                                            return;
                                        }
                                        const val = Number(value);
                                        if (isNaN(val) || val < 0) return;
                                        setCost(val.toFixed(0));
                                    }}
                                    placeholder="170"
                                    className={styles.input} />
                            </label>
                            <label key="MARGIN" className={`${styles.label} ${styles.col6}`}>
                                <div className={`${styles.label}`}>
                                    <span className={styles.labelName}>変動手数料</span>
                                </div>
                                <input value={margin}
                                    onChange={(e) => {
                                        const value = e.target.value.trim();
                                        if (value.length === 0) {
                                            setMargin(value);
                                            return;
                                        }
                                        const val = Number(value);
                                        if (isNaN(val) || val < 0) return;
                                        setMargin(val.toFixed(0));
                                    }}
                                    placeholder="5"
                                    className={styles.input} />
                            </label>
                        </div>
                        <div className={styles.grid}>
                            <label key="RELAY_IP" className={`${styles.label} ${styles.col6}`}>
                                <div className={`${styles.label}`}>
                                    <span className={styles.labelName}>リレーIP</span>
                                </div>
                                <input value={relayIp}
                                    onChange={(e) => {
                                        const value = e.target.value.trim();
                                        setRelayIp(value);
                                    }}
                                    placeholder="xxx.xxx.xxx.xxx"
                                    className={styles.input} />
                            </label>
                            <label key="RELAY_PORT" className={`${styles.label} ${styles.col6}`}>
                                <div className={`${styles.label}`}>
                                    <span className={styles.labelName}>リレーポート</span>
                                </div>
                                <input value={relayPort}
                                    onChange={(e) => {
                                        const value = e.target.value.trim();
                                        if (value.length === 0) {
                                            setRelayPort(value);
                                            return;
                                        }
                                        const val = Number(value);
                                        if (isNaN(val) || val <= 0) return;
                                        setRelayPort(val.toFixed());
                                    }}
                                    placeholder="6000"
                                    className={styles.input} />
                            </label>
                        </div>
                        <div className={styles.grid}>
                            <label key="META_URL" className={`${styles.label} ${styles.col12}`}>
                                <div className={`${styles.label}`}>
                                    <span className={styles.labelName}>メタデータURL</span>
                                </div>
                                <input value={metaUrl}
                                    onChange={(e) => {
                                        const value = e.target.value.trim();
                                        setMetaUrl(value);
                                    }}
                                    placeholder="https://example.com/poolMetaData.json"
                                    className={styles.input} />
                            </label>
                        </div>
                    </div>
                </div>
            </div>
            <CodeBlock language={language}>{rendered}</CodeBlock>
        </div>
    );
}