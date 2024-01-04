import fs from "fs/promises";

export async function renderHTMLTemplate(
	filePath: string,
	args: Record<any, any>
): Promise<string> {
	const templateFile = await fs.readFile(filePath);
	let template = templateFile.toString("utf-8");
	for (const key in args) {
		template = template.replaceAll(`%${key}%`, args[key]);
	}
	return template;
}
