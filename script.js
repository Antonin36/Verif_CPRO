//Script Vérification Automatique Carte Pro
//Créateur : LECONTE Antonin

document.getElementById('urlForm').addEventListener('submit', async function(event) {
    event.preventDefault();
    
    //URL Sources
    const baseUrl1 = 'https://eapspublic.sports.gouv.fr/CartePro/Educateur/';
    const baseUrl2 = 'https://eme-api-core.sports.gouv.fr/api/Educateur/GetPubliEdu';
    //Récupération Elements Formulaire
    const numCPRO = document.getElementById('numCPRO').value;
    const DNComplete = document.getElementById('DNComplete').value;
    //Structure URLs
    const fullUrl1 = `${baseUrl1}${numCPRO}/${DNComplete}`;
    const fullUrl2 = `${baseUrl2}?numCartePro=${numCPRO}`;
    //URL Proxy et Récup Div Message
    const proxyUrl = 'proxy.php?url='; // URL du proxy PHP sur le même serveur
    const messageDiv = document.getElementById('message');
    
    // Fonction pour formater la date de naissance en JJ/MM/AAAA pour la seconde requête
    function formatDate(dateStr) {
        return dateStr.slice(0, 2) + '/' + dateStr.slice(2, 4) + '/' + dateStr.slice(4);
    }

    try {
        // Première requête via le proxy PHP
        let response1 = await fetch(proxyUrl + encodeURIComponent(fullUrl2), { 
            method: 'GET',
        });
        let data1 = await response1.json();
        
        if (response1.ok && !data1.errorCode) {
            // Affiche le succès
            messageDiv.innerHTML = `<p style="color: green;">La Carte Pro est valide.</p>`;

            // Récupère les informations de la réponse JSON
            const nomUsage = data1.nomUsage || "Inconnu";
            const prenom = data1.prenom || "Inconnu";
            const dateNaissance = data1.dateNaissance || "Inconnue";
            const photoSrc = data1.photoSrc || "";

            // Affiche les informations
            messageDiv.innerHTML += `<p><strong>Nom :</strong> ${nomUsage}</p>`;
            messageDiv.innerHTML += `<p><strong>Prénom :</strong> ${prenom}</p>`;
            messageDiv.innerHTML += `<p><strong>Date de Naissance :</strong> ${dateNaissance}</p>`;
            
            // Affiche la photo si disponible
            if (photoSrc) {
                messageDiv.innerHTML += `<p><strong>Photo :</strong></p>`;
                messageDiv.innerHTML += `<img src="data:image/jpeg;base64,${photoSrc}" alt="Photo de ${prenom} ${nomUsage}" style="max-width: 50%; height: auto;" />`;
            } else {
                messageDiv.innerHTML += `<p><strong>Photo :</strong></p>`;
                messageDiv.innerHTML += `<p><strong>La Photo est introuvable ou indisponible.</strong></p>`;
            }

            // Affiche la source de la photo
            messageDiv.innerHTML += `<p><em>Source : API EME (Nouvelle Plateforme)</em></p>`;

            return;
        }

        // Si la première requête échoue, essayer la seconde
        let response2 = await fetch(proxyUrl + encodeURIComponent(fullUrl1), { 
            method: 'GET',
        });
        
        // Vérifiez si la réponse HTML contient id="etatCivil"
        let responseText = await response2.text();

        if (response2.ok && responseText.includes('id="etatCivil"')) {
            // Crée un conteneur temporaire pour analyser le HTML
            let parser = new DOMParser();
            let doc = parser.parseFromString(responseText, 'text/html');
            
            // Recherche du div avec id="etatCivil"
            let etatCivilDiv = doc.getElementById('etatCivil');
            if (!etatCivilDiv) {
                throw new Error('Le div avec id="etatCivil" n\'a pas été trouvé.');
            }

            // Extraction des informations
            const nomMatch = responseText.match(/<b>Nom&nbsp;:\s*<\/b>([^<]*)<br\s*\/>/i);
            const prenomMatch = responseText.match(/<b>Prénom&nbsp;:\s*<\/b>([^<]*)<br\s*\/>/i);
            const photoMatch = etatCivilDiv.querySelector('img') ? etatCivilDiv.querySelector('img').getAttribute('src') : '';

            const nom = nomMatch ? nomMatch[1].trim() : "Inconnu";
            const prenom = prenomMatch ? prenomMatch[1].trim() : "Inconnu";
            const formattedDN = formatDate(DNComplete);

            // Affiche les informations
            messageDiv.innerHTML = `<p style="color: green;">La Carte Pro est valide.</p>`;
            messageDiv.innerHTML += `<p><strong>Nom :</strong> ${nom}</p>`;
            messageDiv.innerHTML += `<p><strong>Prénom :</strong> ${prenom}</p>`;
            messageDiv.innerHTML += `<p><strong>Date de Naissance :</strong> ${formattedDN}</p>`;

            // Affiche la photo si disponible
            if (photoMatch) {
                const photoSrc = `https://eapspublic.sports.gouv.fr${photoMatch}`;
                messageDiv.innerHTML += `<p><strong>Photo :</strong></p>`;
                messageDiv.innerHTML += `<img src="${photoSrc}" alt="Photo de ${prenom} ${nom}" style="max-width: 50%; height: auto;" />`;
            } else {
                messageDiv.innerHTML += `<p><strong>Photo :</strong></p>`;
                messageDiv.innerHTML += `<p><strong>La Photo est introuvable ou indisponible.</strong></p>`;
            }

            // Affiche la source de la photo
            messageDiv.innerHTML += `<p><em>Source : Plateforme EAPS</em></p>`;
        } else {
            messageDiv.textContent = 'La Carte Pro est invalide ou introuvable.';
            messageDiv.style.color = 'red';
        }
    } catch (error) {
        console.error('Error:', error);
        messageDiv.textContent = 'Erreur lors de la vérification de la Carte Pro';
        messageDiv.style.color = 'red';
    }
});
