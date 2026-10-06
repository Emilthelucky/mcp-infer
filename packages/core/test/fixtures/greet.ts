/** Greet the user */
export default async function greet({
    name,
    age,
    tags,
    mode
}: {
    /** The name of the user to greet */
    name: string;
    /** Age in years */
    age?: number;
    tags: string[];
    mode: 'formal' | 'casual';
}) {
    return `Hello, ${name} (${age}, ${tags.join(',')}, ${mode})`;
}
