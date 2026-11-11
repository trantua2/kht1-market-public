export function safeNextPath(value: string | null | undefined) { return value?.startsWith("/") && !value.startsWith("//") ? value : "/market"; }
