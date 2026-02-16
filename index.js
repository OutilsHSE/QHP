
/**
 * Crée dynamiquement les lignes du tableau de participants
 * Génère 10 lignes avec champs nom, prénom et canvas de signature
 */
function createParticipantRows() {
    const tbody = document.querySelector('#obs-table tbody');

    for (let i = 0; i < 10; i++) {
        const row = document.createElement('tr');

        const tdNom = document.createElement('td');
        const inputNom = document.createElement('input');
        inputNom.type = 'text';
        inputNom.name = `nom_${i}`;
        inputNom.placeholder = 'Nom';
        tdNom.appendChild(inputNom);

        const tdPrenom = document.createElement('td');
        const inputPrenom = document.createElement('input');
        inputPrenom.type = 'text';
        inputPrenom.name = `prenom_${i}`;
        inputPrenom.placeholder = 'Prénom';
        tdPrenom.appendChild(inputPrenom);

        const tdSignature = document.createElement('td');
        const canvas = document.createElement('canvas');
        canvas.width = 150;
        canvas.height = 50;
        canvas.id = `signature_${i}`;
        canvas.className = 'signature-canvas';
        tdSignature.appendChild(canvas);

        row.appendChild(tdNom);
        row.appendChild(tdPrenom);
        row.appendChild(tdSignature);
        tbody.appendChild(row);
    }
}

/**
 * Initialise l'application au chargement de la page
 * - Crée les lignes du tableau de participants
 * - Définit la date du jour
 * - Configure les canvas de signature
 */
window.onload = function () {
    // Créer les lignes du tableau
    createParticipantRows();

    // Définir la date du jour
    const dateInput = document.getElementById('visite-date');
    if (dateInput) {
        dateInput.valueAsDate = new Date();
    }

    // Initialiser tous les canvas de signature
    for (let i = 0; i < 10; i++) {
        setupCanvas(`signature_${i}`);
    }

    // Initialiser le canvas de l'animateur
    setupCanvas('drawingCanvas1');
}

/**
 * Configure un canvas pour permettre la signature à la souris ou au tactile
 * @param {string} canvasId - L'ID du canvas à configurer
 */
function setupCanvas(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) {
        console.error(`Canvas avec l'ID "${canvasId}" introuvable`);
        return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
        console.error(`Impossible d'obtenir le contexte 2D pour le canvas "${canvasId}"`);
        return;
    }

    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientHeight;

    let painting = false;

    function startPosition(e) {
        painting = true;
        draw(e);
        e.preventDefault(); // Empêche le comportement par défaut
    }

    function endPosition(e) {
        painting = false;
        ctx.beginPath();
        e.preventDefault(); // Empêche le comportement par défaut
    }

    function draw(e) {
        if (!painting) return;
        const rect = canvas.getBoundingClientRect();
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.strokeStyle = '#000';

        let clientX, clientY;
        if (e.touches && e.touches.length > 0) {
            // Utiliser les coordonnées du premier touch point
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            // Utiliser les coordonnées de la souris
            clientX = e.clientX;
            clientY = e.clientY;
        }

        ctx.lineTo(clientX - rect.left, clientY - rect.top);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(clientX - rect.left, clientY - rect.top);
        e.preventDefault(); // Empêche le comportement par défaut
    }

    // Ajouter des écouteurs pour les événements de souris
    canvas.addEventListener('mousedown', startPosition);
    canvas.addEventListener('mouseup', endPosition);
    canvas.addEventListener('mouseout', endPosition);
    canvas.addEventListener('mousemove', draw);

    // Ajouter des écouteurs pour les événements tactiles
    canvas.addEventListener('touchstart', startPosition);
    canvas.addEventListener('touchend', endPosition);
    canvas.addEventListener('touchcancel', endPosition);
    canvas.addEventListener('touchmove', draw);
}

/**
 * Efface complètement le contenu d'un canvas
 * @param {string} canvasId - L'ID du canvas à effacer
 */
function clearCanvas(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) {
        console.error(`Canvas avec l'ID "${canvasId}" introuvable`);
        return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
        console.error(`Impossible d'obtenir le contexte 2D pour le canvas "${canvasId}"`);
        return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

/**
 * Exporte le formulaire QHP en PDF
 * Utilise la bibliothèque html2pdf pour générer un PDF du document
 * Le nom du fichier inclut la date du jour
 */
function download() {
    // Vérifier que html2pdf est disponible
    if (typeof html2pdf === 'undefined') {
        alert('Erreur: La bibliothèque html2pdf n\'est pas chargée. Veuillez réessayer.');
        console.error('html2pdf n\'est pas disponible');
        return;
    }

    try {
        const element = document.body.cloneNode(true);

        // Supprimer les boutons et éléments non imprimables
        const buttons = element.querySelectorAll('button, .no-print');
        buttons.forEach(btn => btn.remove());

        // Forcer les textareas à afficher leur texte dans une div (comme en mode print)
        const textareas = element.querySelectorAll('textarea.description');
        textareas.forEach(textarea => {
            const div = document.createElement('div');
            div.className = 'print-description';
            div.textContent = textarea.value;
            textarea.parentNode.insertBefore(div, textarea);
            textarea.remove();
        });

        const opt = {
            margin: 0.5,
            filename: 'QHP_' + new Date().toISOString().split('T')[0] + '.pdf',
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
        };

        html2pdf().set(opt).from(element).save();
    } catch (error) {
        alert('Erreur lors de l\'export PDF. Veuillez réessayer.');
        console.error('Erreur lors de l\'export PDF:', error);
    }
}