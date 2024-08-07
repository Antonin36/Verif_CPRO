document.getElementById('urlForm').addEventListener('submit', async function(event) {
    event.preventDefault();
    
    const baseUrl1 = 'https://eapspublic.sports.gouv.fr/CartePro/Educateur/';
    const baseUrl2 = 'https://eme-api-core.sports.gouv.fr/api/Educateur/GetPubliEdu';
    const numCPRO = document.getElementById('numCPRO').value;
    const DNComplete = document.getElementById('DNComplete').value;
    const fullUrl1 = `${baseUrl1}${numCPRO}/${DNComplete}`;
    const fullUrl2 = `${baseUrl2}?numCartePro=${numCPRO}`;
    const proxyUrl = 'proxy.php?url='; // URL du proxy PHP sur le même serveur
    const messageDiv = document.getElementById('message');
    
    try {
        // Première requête via le proxy PHP avec origin spécifique
        let response1 = await fetch(proxyUrl + encodeURIComponent(fullUrl2) + "&origin=" + encodeURIComponent('https://recherche-educateur.sports.gouv.fr'), { 
            method: 'GET',
        });
        let data1 = await response1.json();
        
        if (response1.ok && !data1.errorCode) {
            messageDiv.textContent = 'La Carte Pro est valide.';
            messageDiv.style.color = 'green';
            return;
        }

        // Si la première requête échoue, essayer la seconde
        let response2 = await fetch(proxyUrl + encodeURIComponent(fullUrl1) + "&origin=" + encodeURIComponent('https://eapspublic.sports.gouv.fr'), { 
            method: 'GET',
        });
        
        // Vérifiez si la réponse HTML contient id="etatCivil"
        let responseText = await response2.text();
        if (response2.ok && responseText.includes('id="etatCivil"')) {
            messageDiv.textContent = 'La Carte Pro est valide.';
            messageDiv.style.color = 'green';
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
