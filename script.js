document.addEventListener('DOMContentLoaded', () => {

    // --- Referencias a elementos del GENERADOR ---
    const generateListBtn = document.getElementById('generate-list-btn');
    const prefixInput = document.getElementById('prefix-input');
    const rangeStartInput = document.getElementById('range-start');
    const rangeEndInput = document.getElementById('range-end');

    // --- Referencias a elementos de la CALCULADORA ---
    const calculateBtn = document.getElementById('calculate-btn');
    const populationDataInput = document.getElementById('population-data');
    const sampleSizeInput = document.getElementById('sample-size');
    const startPointInput = document.getElementById('start-point');
    const summaryDiv = document.getElementById('summary');
    const resultsDiv = document.getElementById('sample-results');
    const errorDiv = document.getElementById('error-message');

    // --- LÓGICA PARA EL BOTÓN DE GENERAR LISTA ---
    generateListBtn.addEventListener('click', () => {
        const prefix = prefixInput.value.trim();
        const start = parseInt(rangeStartInput.value, 10);
        const end = parseInt(rangeEndInput.value, 10);

        // Validación simple
        if (isNaN(start) || isNaN(end) || start > end) {
            alert('Por favor, introduce un rango numérico válido (ej. Desde 1 Hasta 40).');
            return;
        }

        const generatedPopulation = [];
        for (let i = start; i <= end; i++) {
            // Si hay un prefijo, lo añade. Si no, solo pone el número.
            const item = prefix ? `${prefix} ${i}` : i;
            generatedPopulation.push(item);
        }

        // Une la lista con saltos de línea y la pone en el textarea principal
        populationDataInput.value = generatedPopulation.join('\n');
    });


    // --- LÓGICA PARA EL BOTÓN DE CALCULAR MUESTRA ---
    calculateBtn.addEventListener('click', () => {
        summaryDiv.innerHTML = '';
        resultsDiv.innerHTML = '';
        errorDiv.textContent = '';

        const populationText = populationDataInput.value.trim();
        const sampleSize = parseInt(sampleSizeInput.value, 10);
        const userStartPoint = startPointInput.value;
        
        const population = populationText.split('\n').filter(item => item.trim() !== '');
        const populationSize = population.length;

        if (populationSize === 0) {
            errorDiv.textContent = 'Error: La lista de la población no puede estar vacía.';
            return;
        }
        if (isNaN(sampleSize) || sampleSize <= 0) {
            errorDiv.textContent = 'Error: El tamaño de la muestra debe ser un número mayor que cero.';
            return;
        }
        if (sampleSize > populationSize) {
            errorDiv.textContent = 'Error: El tamaño de la muestra no puede ser mayor que el tamaño de la población.';
            return;
        }

        const interval = Math.floor(populationSize / sampleSize);
        let startPoint;
        let startPointText;

        if (userStartPoint) {
            const parsedStart = parseInt(userStartPoint, 10);
            if (isNaN(parsedStart) || parsedStart <= 0 || parsedStart > interval) {
                errorDiv.textContent = `Error: El punto de inicio debe ser un número entre 1 y ${interval}.`;
                return;
            }
            startPoint = parsedStart - 1;
            startPointText = `Se usó el punto de inicio #${parsedStart} (seleccionado).`;
        } else {
            startPoint = Math.floor(Math.random() * interval);
            startPointText = `Se seleccionó el elemento #${startPoint + 1} de forma aleatoria para empezar.`;
        }
        
        const sample = [];
        for (let i = startPoint; i < populationSize; i += interval) {
            sample.push(population[i]);
        }

        summaryDiv.innerHTML = `
            <p><strong>Tamaño de la Población (N):</strong> ${populationSize}</p>
            <p><strong>Tamaño de Muestra (n):</strong> ${sampleSize}</p>
            <p><strong>Intervalo de Muestreo (k):</strong> ${interval}</p>
            <p><strong>Punto de Inicio:</strong> ${startPointText}</p>
        `;

        let resultsHTML = '<ol>';
        sample.forEach(item => {
            resultsHTML += `<li>${item}</li>`;
        });
        resultsHTML += '</ol>';
        
        resultsDiv.innerHTML = resultsHTML;
    });
});