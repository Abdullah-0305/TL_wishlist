qimport i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
  .use(LanguageDetector) // Détecte automatiquement la langue du navigateur
  .use(initReactI18next)
  .init({
    resources: {
      fr: {
        translation: {
            "nav": {
                "login": "Connexion",
                "wishlist": "Wishlist",
                "admin": "Admin",
                "stats": "Stats",
                "logout": "Se déconnecter",
                "settings": "Paramètres"
            },
            "wishlist": {
                "loading": "Chargement...",
                "rules_title": "📜 Rappel des règles de Loot",
                "rules_desc": "Important avant de sélectionner vos objets",
                "basic_rule": "💠 Vous pouvez mettre dans la wishlist <1>un seul item pour</1> les Armes, les Armures et les Accessoires.",
                "lock_rule": "🔒 Une fois la wishlist validée, <1>vous ne pourrez plus modifier vos choix</1>.",
                "boss_rules_title": "💎 Règles de Loot (Boss de Guilde)",
                "rule_1_title": "1. Centralisation des Loots",
                "rule_1_desc": "Tous les loots des Boss de Guilde sont envoyés au Coffre de Guilde. La distribution est ensuite gérée par un membre de la Co-Gestion.",
                "rule_2_title": "2. La Wishlist",
                "rule_2_desc": "Vous devez inscrire vos souhaits : Classe, Arme/Armure/Accessoire voulu.",
                "rule_3_title": "3. Attribution et Équité",
                "rule_3_desc": "Priorité aux joueurs <1>présents, anciens et actifs.</1>",
                "rule_4_title": "4. Distribution & Vocal Obligatoire",
                "rule_4_desc": "Le vocal Discord est obligatoire lors des distributions de loots.",
                "change_title": "📩 Changement de Wishlist",
                "change_desc": "Si vous avez déjà obtenu <1>un item de votre wishlist</1> et que vous souhaitez <3> modifier votre choix</3>, vous devez impérativement <5> contacter un membre de la Co-Gestion</5> par message privé.",
                "role_title": "Rôle",
                "role_desc": "Obligatoire pour valider",
                "weapons_title": "Armes",
                "armors_title": "Armures",
                "accessories_title": "Accessoires",
                "archboss_title": "Archboss",
                "select_role": "Sélectionner un rôle",
                "select_weapon": "Choisir une arme",
                "select_armor": "Choisir une armure",
                "select_accessory": "Choisir un accessoire",
                "select_archboss": "Choisir un item",
                "none": "— Aucune —",
                "already_chosen": "Déjà choisi",
                "already_looted": "Tu as déjà loot cet item",
                "looted_tag": "— déjà loot",
                "save": "Sauvegarder",
                "modal_title": "Confirmer la sauvegarde",
                "modal_desc": "Vos items sélectionnés ne pourront plus être modifiés. Êtes-vous sûr ?",
                "cancel": "Annuler",
                "confirm": "Confirmer",
                "save_success": "Wishlist sauvegardée !",
                "save_error": "Erreur lors de la sauvegarde",
                "change_request_sent": "Demande de changement envoyée à la Co-Gestion !",
                "change_request_error": "Erreur lors de l'envoi de la demande. Vous avez peut-être déjà une demande en cours.",
                "change_request_title": "Demande d'échange",
                "change_request_desc": "Sélectionner l'objet que vous souhaitez en remplacement. La Co-Gestion validera votre demande.",
                "new_item_label": "Nouvel objet souhaité :",
                "select_new_item": "Choisir...",
                "send_request": "Envoyer"

            },
            "login": {
                "title": "Bienvenue sur Akatsushi",
                "description": "Connectez-vous pour gérer votre wishlist",
                "label_pseudo": "Pseudo",
                "placeholder_pseudo": "Votre pseudo",
                "label_password": "Mot de passe",
                "button_login": "Se connecter",
                "error_fields": "Veuillez remplir tous les champs",
                "error_invalid": "Pseudo ou mot de passe incorrect",
                "success": "Connexion réussie !"
            },
            "change_password": {
                "title": "Changer votre mot de passe",
                "subtitle": "Vous devez définir un mot de passe personnel avant de continuer.",
                "placeholder_new": "Nouveau mot de passe",
                "placeholder_confirm": "Confirmer le mot de passe",
                "button_update": "Mettre à jour",
                "loading": "Chargement...",
                "error_required": "Tous les champs sont obligatoires",
                "error_mismatch": "Les nouveaux mots de passe ne correspondent pas",
                "error_length": "Le mot de passe doit faire au moins 6 caractères",
                "error_user": "Utilisateur introuvable",
                "error_update": "Erreur lors de la mise à jour.",
                "success": "Mot de passe mis à jour !"
            },
            "maintenance": {
                "title": "Maintenance en cours",
                "message": "Nous mettons à jour la forge de la guilde pour l'international. Revenez d'ici quelques minutes, guerrier !"
            },
            "admin": {
                "load_error": "Erreur lors du chargement des joueurs",
                "items_load_error": "Erreur lors du chargement des items",
                "action_success": "Action réussie !",
                "action_error": "Erreur lors de l'action",
                "reset_presence": "Reset Présence",
                "set_all_presence": "Tout mettre Présent",
                "add_player": "Ajouter un joueur",
                "none": "Aucun(e)",
                "reset_all_confirm": "Tous les items ont été réinitialisés !",
                "actifs": "Actifs",
                "requests": "Demandes",
                "history": "Historique"
            },
            "filter": {
                "label": "Filtrer",
                "placeholder": "— Filtrer par item —",
                "weapons": "Armes",
                "armors": "Armures",
                "accessories": "Accessoires",
                "reset": "Réinitialiser"
            },
            "player_card": {
                "manage": "Gérer",
                "delete_player": "Supprimer le joueur",
                "present": "Présent",
                "choices": "Choix actuels",
                "last_loot": "Dernier loot obtenu : ",
                "none": "Aucun",
                "elevate_player": "Promouvoir le joueur"
            },
            "item_row": {
                "none": "Aucun(e)",
                "no_boss": "Aucun boss",
                "remove_item": "Retirer l'item",
                "status_looted": "Déjà looté (Bloqué)",
                "status_available": "Disponible (Débloqué)"
            },
            "add_player_modal": {
                "title_add": "Recruter un nouveau membre",
                "title_created": "Compte de guilde créé",
                "label_name": "Nom du personnage",
                "placeholder_name": "Pseudo en jeu...",
                "password_label": "Mot de passe provisoire",
                "password_warning": "⚠️ Transmettez ce code au joueur. Il ne sera plus affiché ensuite.",
                "btn_cancel": "Annuler",
                "btn_create": "Forger le compte",
                "success_msg": "Membre ajouté à la légion !"
            },
            "block_modal": {
                "title_block": "Bloquer l'acquisition",
                "title_unblock": "Libérer l'item",
                "desc_block": "Voulez-vous marquer <1>{{item}}</1> comme obtenue pour <3>{{name}}</3> ?",
                "desc_unblock": "Voulez-vous rendre <1>{{item}}</1> de nouveau disponible pour <3>{{name}}</3> ?",
                "btn_block": "Bloquer",
                "btn_unblock": "Débloquer",
                "item_arme": "l'arme",
                "item_armure": "l'armure",
                "item_accessoire": "l'accessoire",
                "btn_cancel": "Annuler"
            },
            "boss_counts": {
                "main_title": "Répartition par Boss",
                "reset_filter": "Réinitialiser le filtre Boss",
                "weapons": "Armes",
                "armors": "Armures",
                "accessories": "Accessoires",
                "no_boss": "Aucun boss requis"
            },
            "delete_player": {
                "title": "Supprimer de la guilde",
                "warning": "Cette action est irréversible. Pour confirmer la suppression de <1>{{name}}</1>, veuillez saisir son nom ci-dessous :",
                "placeholder": "Saisir le nom exact...",
                "error_mismatch": "Le nom ne correspond pas !",
                "btn_confirm": "Confirmer l'expulsion",
                "success": "Le joueur {{name}} a été retiré de la base."
            },
            "admin_header": {
                "title": "Administration",
                "subtitle": "Gérez les wishlists et la distribution des loots",
                "reset_all": "Réinitialiser toute la base",
                "history": "Historique des loots"
            },
            "player_grid": {
                "no_players": "Aucun membre trouvé",
                "try_other_filter": "Essayez de modifier vos filtres ou de réinitialiser la recherche."
            },
            "remove_modal": {
                "title": "Libérer l'emplacement",
                "desc": "Êtes-vous sûr de vouloir retirer <1>{{item}}</1> de la wishlist de <3>{{name}}</3> ?",
                "btn_confirm": "Confirmer",
                "item_arme": "l'arme",
                "item_armure": "l'armure",
                "item_accessoire": "l'accessoire"
            },
            "unlock_all_modal": {
                "title": "Réinitialisation Totale",
                "desc_all": "Attention : Vous allez vider les wishlists et les statuts de loot de TOUS les membres. Cette action est irréversible.",
                "desc_single": "Voulez-vous réinitialiser entièrement la fiche de <1>{{name}}</1> ?",
                "btn_confirm": "Exécuter le Reset"
            },
            "new_admin": {
                "title": "Promotion Officielle",
                "description": "Vous allez élever <1>{{name}}</1> au rang de Co-Gestionnaire. Cette action lui confère les pleins pouvoirs d'administration. Tapez son nom pour valider cette promotion.",
                "btn_cancel": "Annuler la promotion",
                "btn_confirm": "Confirmer",
                "success": "{{name}} a été promu Co-Gestionnaire avec succès. Bienvenue dans l'équipe !",
                "error_mismatch": "Le nom saisi ne correspond pas. Veuillez réessayer.",
                "error_api": "Impossible de promouvoir le joueur. Erreur serveur ou RLS."
            },
            "settings": {
                "title": "Paramètres",
                "tab_boss": "Boss",
                "tab_weapons": "Armes",
                "tab_armors": "Armures",
                "tab_accessories": "Accessoires",
                "tab_archboss": "Archboss",
                "tab_roles": "Rôles",
                "error_load": "Erreur lors du chargement des données",
                "error_names_required": "Les deux noms (FR et EN) sont obligatoires.",
                "saving": "Sauvegarde en cours...",
                "save_success": "Sauvegarde réussie !",
                "save_error": "Erreur lors de la sauvegarde",
                "delete_confirm": "Êtes-vous sûr de vouloir supprimer cet élément ? Cela peut casser les wishlists des joueurs liés !",
                "deleting": "Suppression en cours...",
                "delete_success": "Suppression réussie !",
                "delete_error": "Erreur lors de la suppression",
                "subtitle": "Gestion des listes de la base de données",
                "list_of": "Liste des",
                "add_btn": "Ajouter",
                "edit_btn": "Modifier",
                "delete_btn": "Supprimer",
                "no_items": "Aucun élément trouvé",
                "name_fr": "Francais",
                "name_en": "Anglais",
                "modal_edit_title": "Modifier l'élément",
                "modal_add_title": "Ajouter un nouvel élément",
                "category": "Catégorie",
                "linked_bosses": "Boss liés",
                "single_choice": "(1 choix)",
                "multi_choice": "(Choix multiples)",
                "cancel": "Annuler",
                "save": "Sauvegarder"
            }
        }
      },
      en: {
        translation: {
            "nav": {
                "login": "Login",
                "wishlist": "Wishlist",
                "admin": "Admin",
                "stats": "Stats",
                "logout": "Logout",
                "settings": "Settings"
            },
            "wishlist": {
                "loading": "Loading...",
                "rules_title": "📜 Loot Rules Reminder",
                "rules_desc": "Important before selecting your items",
                "basic_rule": "💠 You can add <1>only one item for</1> Weapons, Armors, and Accessories to your wishlist.",
                "lock_rule": "🔒 Once validated, <1>you won't be able to modify your choices</1>.",
                "boss_rules_title": "💎 Loot Rules (Guild Bosses)",
                "rule_1_title": "1. Centralized Loot",
                "rule_1_desc": "All Guild Boss loot is sent to the Guild Vault. Distribution is managed by a Co-Management member.",
                "rule_2_title": "2. The Wishlist",
                "rule_2_desc": "You must register your wishes: Class, Weapon/Armor/Accessory wanted.",
                "rule_3_title": "3. Allocation & Fairness",
                "rule_3_desc": "Priority to <1>present, veteran, and active players.</1>",
                "rule_4_title": "4. Distribution & Mandatory Voice Chat",
                "rule_4_desc": "Discord voice chat is mandatory during loot distributions.",
                "change_title": "📩 Wishlist Changes",
                "change_desc": "If you have already obtained <1>an item from your wishlist</1> and wish to <3>change your choice</3>, you must <5>contact a Co-Management member</5> via private message.",
                "role_title": "Role",
                "role_desc": "Required to validate",
                "weapons_title": "Weapons",
                "armors_title": "Armors",
                "accessories_title": "Accessories",
                "archboss_title": "Archboss",
                "select_role": "Select a role",
                "select_weapon": "Choose a weapon",
                "select_armor": "Choose an armor",
                "select_accessory": "Choose an accessory",
                "select_archboss": "Choose an item",
                "none": "— None —",
                "already_chosen": "Already chosen",
                "already_looted": "You have already looted this item",
                "looted_tag": "— already looted",
                "save": "Save",
                "modal_title": "Confirm Save",
                "modal_desc": "Selected items cannot be modified later. Are you sure?",
                "cancel": "Cancel",
                "confirm": "Confirm",
                "save_success": "Wishlist saved!",
                "save_error": "Error during save",
                "change_request_sent": "Change request sent to Co-Management!",
                "change_request_error": "Error sending change request. You may have already sent",
                "change_request_title": "Change Request",
                "change_request_desc": "Select the item you want to replace. Co-Management will validate your request.",
                "new_item_label": "New item desired:",
                "select_new_item": "Select...",
                "send_request": "Send"
            },
            "login": {
                "title": "Welcome to Akatsushi",
                "description": "Log in to manage your wishlist",
                "label_pseudo": "Username",
                "placeholder_pseudo": "Your username",
                "label_password": "Password",
                "button_login": "Log In",
                "error_fields": "Please fill in all fields",
                "error_invalid": "Invalid username or password",
                "success": "Login successful!"
            },
            "change_password": {
                "title": "Change your password",
                "subtitle": "You must set a personal password before continuing.",
                "placeholder_new": "New password",
                "placeholder_confirm": "Confirm password",
                "button_update": "Update password",
                "loading": "Loading...",
                "error_required": "All fields are required",
                "error_mismatch": "New passwords do not match",
                "error_length": "Password must be at least 6 characters long",
                "error_user": "User not found",
                "error_update": "Error during update.",
                "success": "Password updated!"
            },
            "maintenance": {
                "title": "Maintenance in progress",
                "message": "We are updating the guild's forge for international players. Come back in a few minutes, warrior!"
            },
            "admin": {
                "load_error": "Error loading players",
                "items_load_error": "Error loading items",
                "action_success": "Action successful!",
                "action_error": "Error during action",
                "reset_presence": "Reset Presence",
                "set_all_presence": "Set All Present",
                "add_player": "Add Player",
                "none": "None",
                "reset_all_confirm": "All items have been reset!",
                "actifs": "Actives",
                "requests": "Requests",
                "history": "History"
            },
            "filter": {
                "label": "Filter",
                "placeholder": "— Filter by item —",
                "weapons": "Weapons",
                "armors": "Armors",
                "accessories": "Accessories",
                "reset": "Reset"
            },
            "player_card": {
                "manage": "Manage",
                "delete_player": "Delete player",
                "present": "Present",
                "choices": "Current choices",
                "last_loot": "Last loot obtained: ",
                "none": "None",
                "elevate_player": "Elevate player"
            },
            "item_row": {
                "none": "None",
                "no_boss": "No boss",
                "remove_item": "Remove item",
                "status_looted": "Looted (Locked)",
                "status_available": "Available (Unlocked)"
            },
            "add_player_modal": {
                "title_add": "Recruit new member",
                "title_created": "Guild account created",
                "label_name": "Character Name",
                "placeholder_name": "In-game pseudo...",
                "password_label": "Temporary password",
                "password_warning": "⚠️ Give this code to the player. It will not be shown again.",
                "btn_cancel": "Cancel",
                "btn_create": "Forge account",
                "success_msg": "Member added to the legion!"
            },
            "block_modal": {
                "title_block": "Block Acquisition",
                "title_unblock": "Release Item",
                "desc_block": "Do you want to mark <1>{{item}}</1> as looted for <3>{{name}}</3> ?",
                "desc_unblock": "Do you want to make <1>{{item}}</1> available again for <3>{{name}}</3> ?",
                "btn_block": "Block",
                "btn_unblock": "Unblock",
                "item_arme": "the weapon",
                "item_armure": "the armor",
                "item_accessoire": "the accessory",
                "btn_cancel": "Cancel"
            },
            "boss_counts": {
                "main_title": "Boss Distribution",
                "reset_filter": "Reset Boss Filter",
                "weapons": "Weapons",
                "armors": "Armors",
                "accessories": "Accessories",
                "no_boss": "No boss required"
            },
            "delete_player": {
                "title": "Remove from guild",
                "warning": "This action is irreversible. To confirm the deletion of <1>{{name}}</1>, please type their name below:",
                "placeholder": "Type exact name...",
                "error_mismatch": "Name does not match!",
                "btn_confirm": "Confirm expulsion",
                "success": "Player {{name}} has been removed from database."
            },
            "admin_header": {
                "title": "Administration",
                "subtitle": "Manage wishlists and loot distribution",
                "reset_all": "Reset all database",
                "history": "Loot History"
            },
            "player_grid": {
                "no_players": "No members found",
                "try_other_filter": "Try changing your filters or resetting the search."
            },
            "remove_modal": {
                "title": "Clear Slot",
                "desc": "Are you sure you want to remove <1>{{item}}</1> from <3>{{name}}</3>'s wishlist?",
                "btn_confirm": "Confirm",
                "item_arme": "the weapon",
                "item_armure": "the armor",
                "item_accessoire": "the accessory"
            },
            "unlock_all_modal": {
                "title": "Total Reset",
                "desc_all": "Warning: You are about to clear wishlists and loot status for ALL members. This action cannot be undone.",
                "desc_single": "Do you want to entirely reset the profile of <1>{{name}}</1> ?",
                "btn_confirm": "Execute Reset"
            },
            "new_admin": {
                "title": "Official Promotion",
                "description": "You are about to elevate <1>{{name}}</1> to the rank of Co-Manager. This action grants them full administrative powers. Type their name to validate this promotion.",
                "btn_cancel": "Cancel promotion",
                "btn_confirm": "Confirm Rank",
                "success": "{{name}} has been successfully promoted to Co-Manager. Welcome to the team!",
                "error_mismatch": "The name entered does not match. Please try again.",
                "error_api": "Unable to promote the player. Server or RLS error."
            },
            "settings": {
                "title": "Settings",
                "tab_boss": "Boss",
                "tab_weapons": "Weapons",
                "tab_armors": "Armors",
                "tab_accessories": "Accessories",
                "tab_archboss": "Archboss",
                "tab_roles": "Roles",
                "error_load": "Error loading data",
                "error_names_required": "Both French and English names are required.",
                "saving": "Saving...",
                "save_success": "Save successful!",
                "save_error": "Error during save",
                "delete_confirm": "Are you sure you want to delete this item? This may break the wishlists of linked players!",              
                "deleting": "Deleting...",
                "delete_success": "Delete successful!",
                "delete_error": "Error during delete",
                "subtitle": "Database Management",
                "list_of": "List of",
                "add_btn": "Add",
                "edit_btn": "Edit",
                "delete_btn": "Delete",
                "no_items": "No items found",
                "name_fr": "French",
                "name_en": "English",
                "modal_edit_title": "Edit Item",
                "modal_add_title": "Add New Item",
                "category": "Category",
                "linked_bosses": "Linked Bosses",
                "single_choice": "(1 choice)",
                "multi_choice": "(Multiple choices)",
                "cancel": "Cancel",
                "save": "Save"
            }
        }
      }
    },
    fallbackLng: "fr", // Si la langue n'est pas trouvée, on met FR par défaut
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;