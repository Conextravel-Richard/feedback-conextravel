document.addEventListener('DOMContentLoaded', () => {

    const form = document.getElementById('feedback-form');
    // --- NOVOS ITENS SELECIONADOS ---
    const feedbackIntro = document.querySelector('.feedback-intro');
    const progressBarContainer = document.querySelector('.progress-bar-container');
    // --- FIM DOS NOVOS ITENS ---
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
            // Recarrega a página para um "reset" limpo
            location.reload();
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

    // Lógica para "Ponto de Destaque (Outros)"
    const pontoDestaqueRadios = form.querySelectorAll('input[name="pontoDestaque"]');
    const outrosDestaqueContainer = document.getElementById('outros-destaque-container');
    const outrosDestaqueTexto = document.getElementById('destaque-outros-texto');
    
    pontoDestaqueRadios.forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            const outrosCheckbox = document.getElementById('destaque-outros');
            if (outrosCheckbox.checked) {
                outrosDestaqueContainer.classList.add('visible');
                outrosDestaqueTexto.required = true;
            } else {
                outrosDestaqueContainer.classList.remove('visible');
                outrosDestaqueTexto.required = false;
                outrosDestaqueTexto.value = '';
            }
        });
    });

    // Lógica para "Indicaria (Não)"
    const indicariaRadios = form.querySelectorAll('input[name="indicaria"]');
    const motivoNaoContainer = document.getElementById('motivo-nao-container');
    const motivoNaoTexto = document.getElementById('motivo-nao-texto');

    indicariaRadios.forEach(radio => {
        radio.addEventListener('change', () => {
            const indicaNao = document.getElementById('indica-nao');
            if (indicaNao.checked) {
                motivoNaoContainer.classList.add('visible');
                motivoNaoTexto.required = true;
            } else {
                motivoNaoContainer.classList.remove('visible');
                motivoNaoTexto.required = false;
                motivoNaoTexto.value = '';
            }
        });
    });

    nextButtons.forEach(button => {
        button.addEventListener('click', () => {
            let isValid = true;
            const currentInputs = formSteps[currentStep].querySelectorAll('[required]');
            let checkedGroups = {};

            currentInputs.forEach(input => {
                if (input.offsetParent === null) return; 

                if (input.type === 'radio' || input.type === 'checkbox') {
                    const groupName = input.name;
                    if (checkedGroups[groupName] === undefined) { 
                        if (!form.querySelector(`input[name="${groupName}"]:checked`)) {
                            isValid = false;
                        }
                        checkedGroups[groupName] = true;
                    }
                } else if (!input.checkValidity()) {
                    isValid = false;
                }
            });
            
            if (isValid) {
                showStep(currentStep + 1);
            } else {
                form.reportValidity();
            }
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
            seuNome: formData.get('seuNome'),
            satisfacaoAtendimento: formData.get('satisfacaoAtendimento'),
            pontoDestaque: formData.getAll('pontoDestaque').join(', '),
            pontoDestaqueOutros: formData.get('pontoDestaqueOutros'),
            conheceEventos: formData.getAll('conheceEventos').join(', '),
            indicaria: formData.get('indicaria'),
            indicariaMotivo: formData.get('indicariaMotivo'),
            comentarios: formData.get('comentarios')
        };
        
        try {
            const response = await fetch('/api/submit-form', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            if (response.ok) {
                // --- ATUALIZAÇÃO AQUI ---
                // Esconde tudo, exceto a mensagem de status
                form.style.display = 'none';
                feedbackIntro.style.display = 'none';
                progressBarContainer.style.display = 'none';
                
                // Adiciona a mensagem e uma classe para estilização
                statusMessage.innerHTML = `<h2>Obrigado!</h2><p>Seu feedback foi recebido com sucesso. Ele é muito importante para a Conextravel.</p>`;
                statusMessage.classList.add('success'); 
                // --- FIM DA ATUALIZAÇÃO ---
            } else {
                throw new Error('Houve uma falha no servidor.');
            }
        } catch (error) {
            console.error('Erro ao enviar formulário:', error);
            statusMessage.textContent = 'Houve um erro ao enviar seu feedback. Tente novamente.';
            statusMessage.style.color = 'red';
        }
    });

    showStep(0);
});