/** Create a task in the team's task tracker */
export default async function createTask({
    title,
    priority,
    assignees,
    due
}: {
    /** Short summary of the task */
    title: string;
    /** How urgent the task is */
    priority: 'low' | 'medium' | 'high';
    /** Usernames to assign the task to */
    assignees: string[];
    /** Optional due date */
    due?: {
        /** Day of month (1-31) */
        day: number;
        /** Month (1-12) */
        month: number;
    };
}) {
    const id = Math.floor(Math.random() * 1000);
    const dueText = due ? ` due ${due.day}/${due.month}` : '';
    return `Created task #${id} "${title}" [${priority}] for ${assignees.join(', ')}${dueText}`;
}
