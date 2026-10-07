import DOMPurify from "dompurify";

export const sanitizeHtml = (content: string): string=>{
    if (!content) return ''
    return DOMPurify.sanitize(content, {
        ADD_ATTR: ['target', 'rel']
    })
}