export function isAdmin(message) {
    return message.member.permissions.has("Administrator");
}
