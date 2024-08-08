document.getElementById('urlForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    //URL APIs
    const baseUrl1 = 'https://eapspublic.sports.gouv.fr/CartePro/Educateur/';
    const baseUrl2 = 'https://eme-api-core.sports.gouv.fr/api/Educateur/GetPubliEdu';
    //Récup Données Formulaire
    const numCPRO = document.getElementById('numCPRO').value;
    const DNComplete = document.getElementById('DNComplete').value;
    //Formatage URLs
    const fullUrl1 = `${baseUrl1}${numCPRO}/${DNComplete}`;
    const fullUrl2 = `${baseUrl2}?numCartePro=${numCPRO}`;
    //Proxy
    const proxyUrl = 'proxy.php?url='; // URL du proxy PHP sur le même serveur
    //Récup div HTML
    const messageDiv = document.getElementById('message');
    
    // Fonction pour formater la date de naissance en JJ/MM/AAAA
    function formatDate(dateStr) {
        return dateStr.slice(0, 2) + '/' + dateStr.slice(2, 4) + '/' + dateStr.slice(4);
    }

    try {
        // Première requête via le proxy PHP avec origin spécifique
        let response1 = await fetch(proxyUrl + encodeURIComponent(fullUrl2) + "&origin=" + encodeURIComponent('https://recherche-educateur.sports.gouv.fr'), { 
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

            // Affiche les informations
            messageDiv.innerHTML += `<p><strong>Nom :</strong> ${nomUsage}</p>`;
            messageDiv.innerHTML += `<p><strong>Prénom :</strong> ${prenom}</p>`;
            messageDiv.innerHTML += `<p><strong>Date de Naissance :</strong> ${dateNaissance}</p>`;

            return;
        }

        // Si la première requête échoue, essayer la seconde
        let response2 = await fetch(proxyUrl + encodeURIComponent(fullUrl1) + "&origin=" + encodeURIComponent('https://eapspublic.sports.gouv.fr'), { 
            method: 'GET',
        });
        
        // Vérifiez si la réponse HTML contient id="etatCivil"
        let responseText = await response2.text();
        if (response2.ok && responseText.includes('id="etatCivil"')) {
            messageDiv.innerHTML = `<p style="color: green;">La Carte Pro est valide.</p>`;

            // Extraction du nom
            const nomMatch = responseText.match(/<b>Nom&nbsp;:\s*<\/b>([^<]*)<br\s*\/>/i);
            const nom = nomMatch ? nomMatch[1].trim() : "Inconnu";

            // Extraction du prénom
            const prenomMatch = responseText.match(/<b>Prénom&nbsp;:\s*<\/b>([^<]*)<br\s*\/>/i);
            const prenom = prenomMatch ? prenomMatch[1].trim() : "Inconnu";

            // Formatage de la date de naissance
            const formattedDN = formatDate(DNComplete);

            // Affiche les informations
            messageDiv.innerHTML += `<p><strong>Nom :</strong> ${nom}</p>`;
            messageDiv.innerHTML += `<p><strong>Prénom :</strong> ${prenom}</p>`;
            messageDiv.innerHTML += `<p><strong>Date de Naissance :</strong> ${formattedDN}</p>`;
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
