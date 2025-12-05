import cloudscraper # L'arme secrète
from bs4 import BeautifulSoup
import json
import time
import random
import os

# --- CONFIGURATION ---
TARGET_PLAYER_COUNT = 50 
BASE_URL_TEMPLATE = "https://www.futbin.com/25/players?page={}&sort=likes&order=desc"

# Mots-clés à exclure
BANNED_VERSIONS = ["Icon", "Hero", "Prime", "Mid", "Baby", "Centurions Icon", "Winter Wildcards Icon", "TOTY Icon"]

# On crée le scraper qui va contourner les protections
scraper = cloudscraper.create_scraper(
    browser={
        'browser': 'chrome',
        'platform': 'windows',
        'desktop': True
    }
)

def get_soup(url):
    try:
        print(f"🔄 Connexion à : {url} ...")
        # On utilise scraper.get au lieu de requests.get
        response = scraper.get(url)
        
        if response.status_code == 200:
            return BeautifulSoup(response.text, 'html.parser')
        elif response.status_code == 429:
            print("⚠️  Trop de requêtes ! Pause de 30 secondes...")
            time.sleep(30)
            return None
        else:
            print(f"❌ Erreur {response.status_code}")
            return None
    except Exception as e:
        print(f"❌ Erreur technique : {e}")
        return None

def get_detailed_stats(player_url):
    """Récupère les détails depuis la fiche joueur"""
    full_url = "https://www.futbin.com" + player_url
    # Petite pause pour ne pas être suspect
    time.sleep(random.uniform(1, 2)) 
    
    soup = get_soup(full_url)
    if not soup: return None

    details = {}
    # Mapping des stats (Nom sur le site -> Notre variable)
    keywords = {
        "Acceleration": "acceleration", "Sprint Speed": "sprint_speed",
        "Finishing": "finishing", "Shot Power": "shot_power", "Long Shots": "long_shots",
        "Vision": "vision", "Short Passing": "short_passing", "Long Passing": "long_passing",
        "Agility": "agility", "Balance": "balance", "Reactions": "reactions", 
        "Ball Control": "ball_control", "Dribbling": "dribbling", "Composure": "composure",
        "Interceptions": "interceptions", "Heading Accuracy": "heading_accuracy", 
        "Def. Awareness": "def_awareness", "Standing Tackle": "standing_tackle", 
        "Sliding Tackle": "sliding_tackle",
        "Jumping": "jumping", "Stamina": "stamina", "Strength": "strength", "Aggression": "aggression"
    }

    try:
        # On cherche les stats dans la page
        for key_display, key_json in keywords.items():
            # Astuce : On cherche le texte exact
            found = soup.find(string=key_display)
            if found:
                # Sur Futbin, le chiffre est souvent juste à côté ou dans le parent
                # Ex: <div>Acceleration</div><div>90</div>
                # On remonte aux parents pour trouver le chiffre associé
                parent = found.parent.parent
                text_content = parent.text.replace(key_display, "").strip()
                
                # On extrait juste les chiffres
                digits = ''.join(filter(str.isdigit, text_content))
                if digits:
                    details[key_json] = int(digits)
                else:
                    details[key_json] = 0
            else:
                details[key_json] = 0
                
        return details

    except Exception as e:
        print(f"⚠️ Erreur détails : {e}")
        return None

def parse_player(row):
    try:
        cols = row.find_all('td')
        if not cols or len(cols) < 5: return None

        row_text = row.text.strip()
        # Filtre anti-Icones
        if any(banned in row_text for banned in BANNED_VERSIONS): return None 

        # Nom
        name_tag = row.find('a', class_='player_name_players_table')
        if not name_tag: return None
        name = name_tag.text.strip()
        
        # Note
        rating_tag = row.find('span', class_='form-rating')
        rating = int(rating_tag.text.strip()) if rating_tag else 0
        if rating < 80: return None # On garde que les 80+ pour aller plus vite

        # Position
        pos_tag = row.find('div', class_='font-weight-bold')
        position = pos_tag.text.strip() if pos_tag else "MC"

        # Image
        img_tag = row.find('img', class_='player-image')
        image_url = "https://cdn.futbin.com/content/fifa25/img/players/p231747.png"
        if img_tag:
            image_url = img_tag.get('data-original') or img_tag.get('src')
            if image_url and image_url.startswith('/'): image_url = "https://futbin.com" + image_url

        # Stats de base (Carte)
        stats_cells = row.find_all('span', class_='stat')
        stats = {"pac": 0, "sho": 0, "pas": 0, "dri": 0, "def": 0, "phy": 0}
        if len(stats_cells) >= 6:
            stats = {
                "pac": int(stats_cells[0].text), "sho": int(stats_cells[1].text),
                "pas": int(stats_cells[2].text), "dri": int(stats_cells[3].text),
                "def": int(stats_cells[4].text), "phy": int(stats_cells[5].text)
            }

        # Prix
        price_tag = row.find('span', class_='ps4_color')
        price = price_tag.text.strip() if price_tag else "0"

        # ID
        link = name_tag['href']
        player_id = int(link.split('/')[3]) if link else random.randint(10000, 99999)

        print(f"   🔎 Récupération détails pour {name}...")
        
        # Récupération des stats détaillées (Page Profil)
        detailed_stats = get_detailed_stats(link)

        return {
            "id": player_id,
            "name": name,
            "rating": rating,
            "position": position,
            "image": image_url,
            "club_img": "https://upload.wikimedia.org/wikipedia/commons/9/92/Flag_of_Belgium_%28civil%29.svg",
            "nation_img": "https://upload.wikimedia.org/wikipedia/en/thumb/5/56/Real_Madrid_CF.svg/1200px-Real_Madrid_CF.svg.png",
            "stats": stats,
            "price": price,
            "detailedStats": detailed_stats
        }

    except Exception:
        return None

def main():
    print(f"🚀 Démarrage Scraper Blindé (Cloudscraper)... Objectif : {TARGET_PLAYER_COUNT} joueurs")
    
    all_players = []
    current_page = 1
    
    while len(all_players) < TARGET_PLAYER_COUNT:
        print(f"\n📄 Page {current_page}...")
        url = BASE_URL_TEMPLATE.format(current_page)
        soup = get_soup(url)
        
        if soup:
            table_rows = soup.select('tr.player_tr_1, tr.player_tr_2')
            
            if not table_rows:
                # Si pas de lignes, c'est peut-être un blocage temporaire ou une page vide
                print("⚠️  Page vide ou bloquée. On tente la suivante...")
            
            for row in table_rows:
                if len(all_players) >= TARGET_PLAYER_COUNT: break
                
                player_data = parse_player(row)
                
                if player_data:
                    # Vérif doublon
                    if not any(p['id'] == player_data['id'] for p in all_players):
                        all_players.append(player_data)
                        print(f"   ✅ [Total: {len(all_players)}/{TARGET_PLAYER_COUNT}] {player_data['name']} ajouté !")

        current_page += 1
        # Pause entre les pages de liste
        time.sleep(random.uniform(2, 4))

    # Sauvegarde
    os.makedirs(os.path.join('src', 'data'), exist_ok=True)
    output_path = os.path.join('src', 'data', 'players.json')
    
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(all_players, f, indent=2, ensure_ascii=False)

    print(f"\n✨ SUCCÈS ! {len(all_players)} joueurs sauvegardés dans {output_path}")

if __name__ == "__main__":
    main()