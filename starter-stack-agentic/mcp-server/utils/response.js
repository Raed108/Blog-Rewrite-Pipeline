export function text(data) {

    return {
        content: [
            {
                type: "text",
                text: typeof data === "string"
                        ? data
                        : JSON.stringify(data, null, 2)
            }
        ]
    };
}