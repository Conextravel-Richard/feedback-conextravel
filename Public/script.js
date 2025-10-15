document.addEventListener('DOMContentLoaded', () => {

    const form = document.getElementById('feedback-form');
    const formSteps = Array.from(form.querySelectorAll('.form-step'));
    const progressBar = document.getElementById('progress-bar');
    const nextButtons = form.querySelectorAll('.nav-button.next');
    const prevButtons = form.querySelectorAll('.nav-button.prev');
    const statusMessage = document.getElementById('status-message');
    const rangeInput = document.getElementById('satisfacao-atendimento');
    const rangeValueDisplay = document.querySelector('.range-value-display');
    let currentStep = 0;

    function showStep(stepIndex) {
        formSteps.forEach((step, index) => {
            step.classList.toggle('active-step', index === stepIndex);
        });
        currentStep = stepIndex;

        const progress = (currentStep / (formSteps.length - 1)) * 100;
        progressBar.style.width = `${progress}%`;
    }
    
    const logoLink = document.getElementById('logo-link');
    if (logoLink) {
        logoLink.addEventListener('click', (event) => {
            event.preventDefault();
            if (form.style.display !== 'none') {
                form.reset();
                outrosDestaqueContainer.classList.remove('visible');
                outrosDestaqueTexto.required = false;
                showStep(0);
            } else {
                location.reload();
            }
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    const textInputs = form.querySelectorAll('input[type="text"]');
    textInputs.forEach(input => {
        input.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                const currentStepElement = event.target.closest('.form-step');
                const nextButton = currentStepElement.querySelector('.nav-button.next');
                if (nextButton) nextButton.click();
            }
        });
    });

    const pontoDestaqueRadios = form.querySelectorAll('input[name="pontoDestaque"]');
    const outrosDestaqueContainer = document.getElementById('outros-destaque-container');
    const outrosDestaqueTexto = document.getElementById('destaque-outros-texto');
    pontoDestaqueRadios.forEach(radio => {
        radio.addEventListener('change', () => {
            if (radio.value === 'Outros' && radio.checked) {
                outrosDestaqueContainer.classList.add('visible');
                outrosDestaqueTexto.required = true;
            } else {
                outrosDestaqueContainer.classList.remove('visible');
                outrosDestaqueTexto.required = false;
                outrosDestaqueTexto.value = '';
            }
        });
    });

    nextButtons.forEach(button => {
        button.addEventListener('click', () => {
            const currentInputs = formSteps[currentStep].querySelectorAll('[required]');
            let isValid = true;
            currentInputs.forEach(input => {
                if (input.offsetWidth > 0 || input.offsetHeight > 0) {
                    if (input.type === 'radio') {
                        const radioGroupName = input.name;
                        if (!form.querySelector(`input[name="${radioGroupName}"]:checked`)) isValid = false;
                    } else if (!input.value.trim()) {
                        isValid = false;
                    }
                }
            });
            if (isValid && currentStep < formSteps.length - 1) showStep(currentStep + 1);
        });
    });

    prevButtons.forEach(button => {
        button.addEventListener('click', () => {
            if (currentStep > 0) showStep(currentStep - 1);
        });
    });

    if (rangeInput && rangeValueDisplay) {
        rangeInput.addEventListener('input', () => {
            rangeValueDisplay.textContent = rangeInput.value;
        });
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        statusMessage.textContent = 'Enviando seu feedback...';
        statusMessage.style.color = 'var(--conextravel-azul)';
        const formData = new FormData(form);
        const data = {
            nomeEmpresa: formData.get('nomeEmpresa'),
            satisfacaoAtendimento: formData.get('satisfacaoAtendimento'),
            pontoDestaque: formData.get('pontoDestaque'),
            pontoDestaqueOutros: formData.get('pontoDestaqueOutros'),
            conheceEventos: formData.get('conheceEventos'),
            comentarios: formData.get('comentarios')
        };
        try {
            const response = await fetch('/api/submit-form', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            if (response.ok) {
                progressBar.style.width = '100%';
                form.style.display = 'none';
                statusMessage.innerHTML = `<h2>Obrigado!</h2><p>Seu feedback foi recebido com sucesso. Ele é muito importante para a Conextravel.</p>`;
                statusMessage.style.color = 'var(--conextravel-texto)';
            } else {
                throw new Error('Houve uma falha no servidor.');
            }
        } catch (error) {
            console.error('Erro ao enviar formulário:', error);
            statusMessage.textContent = 'Houve um erro ao enviar seu feedback. Tente novamente.';
            statusMessage.style.color = 'red';
        }
    });

    // Inicia o formulário na primeira etapa
    showStep(0);
});