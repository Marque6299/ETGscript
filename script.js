document.addEventListener('DOMContentLoaded', function () {
    // DOM Elements
    const elements = {
        sidebar: document.getElementById('sidebar'),
        toggleSidebarBtn: document.getElementById('toggleSidebar'),
        closeSidebarBtn: document.getElementById('closeSidebar'),
        clearFormBtn: document.getElementById('clearForm'),
        tooltip: document.getElementById('tooltip'),
        navButtons: document.querySelectorAll('.nav-btn'),
        formInputs: document.querySelectorAll('.form-group input'),
        searchInput: document.querySelector('.search-input'),
        scriptCards: document.querySelectorAll('.script-card'),
        sections: document.querySelectorAll('.interaction-section') // All main sections
    };

    // State
    let formData = {
        agentName: '',
        customerName: '',
        intent: ''
    };
    let lastScrollPosition = 0;

    // Helper Functions
    const updatePlaceholders = () => {
        document.querySelectorAll('.customer_name').forEach(el => {
            el.textContent = formData.customerName || '[customer name]';
        });
        document.querySelectorAll('.agent_name').forEach(el => {
            el.textContent = formData.agentName || '[agent name]';
        });
        document.querySelectorAll('.intent').forEach(el => {
            el.textContent = formData.intent || '[intent]';
        });
    };

    const toggleSidebar = () => {
        const isOpen = elements.sidebar.classList.toggle('open');
        document.body.style.overflow = isOpen ? 'hidden' : '';
        if (!isOpen) window.scrollTo(0, lastScrollPosition);
    };

    const showTooltip = (message, element) => {
        const rect = element.getBoundingClientRect();
        elements.tooltip.textContent = message;
        elements.tooltip.style.top = `${rect.top - 40}px`;
        elements.tooltip.style.left = `${rect.left + (rect.width / 2) - (elements.tooltip.offsetWidth / 2)}px`;
        elements.tooltip.classList.add('show');
        setTimeout(() => elements.tooltip.classList.remove('show'), 2000);
    };

    window.copyToClipboard = (element) => {
        const text = element.innerHTML.trim().replace(/<br\s*\/?>/g, '\n');
        navigator.clipboard.writeText(text)
            .then(() => showTooltip('Copied!', element))
            .catch(err => {
                showTooltip('Failed to copy!', element);
                console.error('Clipboard Error:', err);
            });
    };

    const handleSwipe = (startX, endX) => {
        const swipeDistance = endX - startX;
        const threshold = 100;
        if (Math.abs(swipeDistance) > threshold) {
            if (swipeDistance > 0) toggleSidebar();
            else if (swipeDistance < 0 && elements.sidebar.classList.contains('open')) toggleSidebar();
        }
    };

    const updateSections = (activeSectionId) => {
        elements.sections.forEach(section => {
            section.style.display = section.id === activeSectionId ? 'block' : 'none';
        });
    };

    // Event Listeners
    elements.toggleSidebarBtn.addEventListener('click', toggleSidebar);
    elements.closeSidebarBtn.addEventListener('click', toggleSidebar);

    document.addEventListener('click', (e) => {
        if (elements.sidebar.classList.contains('open') &&
            !elements.sidebar.contains(e.target) &&
            !elements.toggleSidebarBtn.contains(e.target)) {
            toggleSidebar();
        }
    });

    elements.navButtons.forEach(button => {
        button.addEventListener('click', () => {
            elements.navButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            const sectionId = button.id.replace('-section', '-section');
            updateSections(sectionId);
        });
    });

    elements.formInputs.forEach(input => {
        input.addEventListener('input', (e) => {
            formData[e.target.id] = e.target.value;
            updatePlaceholders();
        });
    });


    //code to clear the form (all)//
    /*elements.clearFormBtn.addEventListener('click', () => {
        formData = { agentName: '', customerName: '', intent: '' };
        elements.formInputs.forEach(input => input.value = '');
        updatePlaceholders();
    });*/

    //Code to exclude Agent name (clear)//
    elements.clearFormBtn.addEventListener('click', () => {
        // Only clear customerName and intent, leave agentName unchanged
        formData.customerName = '';
        formData.intent = '';
    
        // Update input fields for customerName and intent only
        elements.formInputs.forEach(input => {
            if (input.id !== 'agentName') {
                input.value = '';
            }
        });
    
        // Update placeholders to reflect cleared fields
        updatePlaceholders();
    });

    //Search inputs function//
    elements.searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase().trim();
        const sections = document.querySelectorAll('.interaction-section');
        const activeSectionId = document.querySelector('.nav-btn.active').id.replace('-section', '');
    
        // Reset to show only the active section if the search bar is empty
        if (searchTerm === '') {
            sections.forEach(section => {
                const sectionId = section.id;
    
                if (sectionId === `${activeSectionId}-section`) {
                    section.style.display = ''; // Show the active section
                    section.querySelectorAll('.section-header').forEach(header => {
                        header.style.display = ''; // Show all headers in the active section
                        header.nextElementSibling.style.display = ''; // Show their content
                    });
                } else {
                    section.style.display = 'none'; // Hide other sections
                }
            });
            return;
        }
    
        // Hide all headers and contents initially
        sections.forEach(section => {
            let hasMatch = false; // Track if the section has at least one matching header
    
            section.querySelectorAll('.section-header').forEach(header => {
                const headerText = header.textContent.toLowerCase();
    
                if (headerText.includes(searchTerm)) {
                    header.style.display = ''; // Show the matching header
                    header.nextElementSibling.style.display = ''; // Show its content
                    hasMatch = true;
                } else {
                    header.style.display = 'none'; // Hide non-matching headers
                    header.nextElementSibling.style.display = 'none'; // Hide their content
                }
            });
    
            // Hide the section if no matches were found within it
            section.style.display = hasMatch ? '' : 'none';
        });
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            // Check if the sidebar is currently open
            if (elements.sidebar.classList.contains('open')) {
                toggleSidebar(); // Close the sidebar
            } else {
                toggleSidebar(); // Open the sidebar
            }
        }
    });

    // Touch support for swipe
    let touchStartX = 0;
    document.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    });
    document.addEventListener('touchend', (e) => {
        handleSwipe(touchStartX, e.changedTouches[0].screenX);
    });

    // Initialize placeholders
    updatePlaceholders();

    // Initialize sections: Default to "opening-section"
    updateSections('opening-section');
});
