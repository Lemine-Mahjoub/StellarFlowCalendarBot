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
    "title": "Bienvenue sur le bot de StellarFlow !",
    "description": "Voici les commandes disponibles pour le bot :",
    "commands": [
        {
            "name": "!semaine",
            "usage": "!semaine",
            "description": "Affiche un planning interactif des animations de la semaine avec:\n- Vue par jour (00h à 23h)\n- Navigation entre les jours\n- Animations en cours\n- Session interactive de 5 minutes\n- Mise à jour en temps réel"
        },
        {
            "name": "!challenge",
            "usage": "!challenge",
            "description": "Affiche la liste des challenges en cours et à venir avec:\n- Nom du challenge\n- Description détaillée\n- Période (dates de début et fin)\n- Récompense\nLes challenges sont triés par date de fin."
        },
        {
            "name": "!profil",
            "usage": "!profil",
            "description": "Affiche le profil détaillé de l'utilisateur incluant:\n- Nom d'utilisateur\n- Avatar\n- Rôles (hors everyone)\n- ID utilisateur\nL'affichage utilise une couleur aléatoire pour l'embed."
        },
        {
            "name": "!addchallenge",
            "usage": "!addchallenge",
            "description": "(Accès Admin)\n Création interactive d'un nouveau challenge. Le bot vous guidera étape par étape:\n1. Date de début (YYYY-MM-DD)\n2. Date de fin (YYYY-MM-DD)\n3. Nom du challenge\n4. Description détaillée\n5. Récompense\n\nCaractéristiques:\n- Validation des dates\n- Confirmation finale avec résumé\n- Timeout de 60s par étape\n- Nécessite les permissions administrateur"
        },
        {
            "name": "!deletechallenge",
            "usage": "!deletechallenge [nom]",
            "description": "(Accès Admin)\nSupprime un challenge existant.\nCaractéristiques:\n- Requiert le nom exact du challenge\n- Confirmation de suppression\n- Message d'erreur si non trouvé\n- Nécessite les permissions administrateur"
        },
        {
            "name": "!anim",
            "usage": "!anim",
            "description": "Affiche la liste des animations prévues avec:\n- Date et heure de début\n- Titre\n- Description\n- Date et heure de fin\nLes animations sont triées par date de début."
        },
        {
            "name": "!addanim",
            "usage": "!addanim",
            "description": "(Accès Admin)\n Création interactive d'une nouvelle animation. Étapes:\n1. Date de début (YYYY-MM-DD)\n2. Heure de début (HHhMM)\n3. Date de fin (YYYY-MM-DD)\n4. Heure de fin (HHhMM)\n5. Titre\n6. Description\n\nCaractéristiques:\n- Validation des dates et heures\n- Confirmation finale\n- Timeout de 60s par étape\n- Nécessite les permissions administrateur"
        },
        {
            "name": "!deleteanim",
            "usage": "!deleteanim [nom]",
            "description": "(Accès Admin)\n Supprime une animation existante.\nCaractéristiques:\n- Requiert le titre exact de l'animation\n- Confirmation de suppression\n- Message d'erreur si non trouvée\n- Nécessite les permissions administrateur"
        },
        {
            "name": "!help",
            "usage": "!help",
            "description": "Affiche ce menu d'aide détaillé avec:\n- Liste complète des commandes\n- Usage de chaque commande\n- Description détaillée\n- Permissions requises"
        }
    ]
}
