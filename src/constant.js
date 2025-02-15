export const commandes = {
    semaine: "!semaine",
    challenge: "!challenge",
    profil: "!profil",
    addChallenge: "!addchallenge",
    deleteChallenge: "!deletechallenge",
    addAnim: "!addanim",
    deleteAnim: "!deleteanim",
    anim: "!anim",
    help: "!help",
}

export const helpMessage = {
    "title": "Commandes disponibles",
    "description": "Voici les commandes disponibles pour le bot :",
    "commands": [
        {
            "name": "!semaine",
            "usage": "!semaine",
            "description": "Affiche les animations de la semaine"
        },
        {
            "name": "!challenge",
            "usage": "!challenge",
            "description": "Affiche le challenge de la semaine"
        },
        {
            "name": "!profil",
            "usage": "!profil",
            "description": "Affiche le profil de l'utilisateur"
        },
        {
            "name": "!addchallenge",
            "usage": "!addchallenge [nom] [description] [dateDebut (YYYY-MM-DD)] [dateFin (YYYY-MM-DD)] [recompense]",
            "description": "Ajoute un challenge"
        },
        {
            "name": "!deletechallenge",
            "usage": "!deletechallenge [nom]",
            "description": "Supprime un challenge"
        },
        {
            "name": "!anim",
            "usage": "!anim",
            "description": "Affiche les animations"
        },
        {
            "name": "!addanim",
            "usage": "!addanim [date (YYYY-MM-DD)] [heure (HHhMM)] [nom]",
            "description": "Ajoute une animation"
        },
        {
            "name": "!deleteanim",
            "usage": "!deleteanim [nom]",
            "description": "Supprime une animation"
        },

        {
            "name": "!help",
            "usage": "!help",
            "description": "Affiche les commandes disponibles"
        }
    ]
}

export const stellarFlowIcon = 'https://imgur.com/a/rXdzyTj'