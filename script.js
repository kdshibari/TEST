<script src="https://cdn.jsdelivr.net/npm/lz-string@1.5.0/libs/lz-string.min.js"></script>\
<script>\
const VALUES = ['Hard Limit', 'Curious', 'Moderate', 'Oh Yes'];\
const COLORS = ['#EF5350', '#FF914D', '#FFCA28', '#26A69A'];\
let meSliders, partnerSliders, notesTextarea, yourNameInput, recipientNameInput;\
const STORAGE_KEY = 'kinkyMapState';\
\
function showToast(message) \{\
                                const toast = document.createElement('div');\
                                toast.className = 'toast';\
                                toast.textContent = message;\
                                document.getElementById('toastContainer').appendChild(toast);\
                                requestAnimationFrame(() => toast.classList.add('show'));\
                                setTimeout(() => \{\
                                    toast.classList.remove('show');\
                                    toast.addEventListener('transitionend', () => toast.remove());\
                                \}, 2000);\
                            \}\
\
function resetSliders() \{\
                                if (window.confirm('Are you sure you want to reset all sliders, notes, and names? This cannot be undone.')) \{\
                                    meSliders.forEach(slider => \{\
                                        slider.value = 0;\
                                        updatePreference(slider, false);\
                                    \});\
                                    partnerSliders.forEach(slider => \{\
                                        slider.value = 0;\
                                        updatePreference(slider, false);\
                                    \});\
                                    notesTextarea.value = '';\
                                    yourNameInput.value = 'I am: ';\
                                    recipientNameInput.value = 'I am sending this to: ';\
                                    updateTabNames(); // Reset tab names to "Me" and "Partner"\
                                    saveState();\
                                    updateUrl();\
                                    showToast('Sliders, notes, and names reset');\
                                \}\
                            \}\
\
function openTab(tabName) \{\
                                document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));\
                                document.getElementById(tabName)?.classList.add('active');\
                                document.querySelectorAll('.tab-button').forEach(button => button.classList.remove('active'));\
                                document.querySelector(`button[onclick="openTab('$\{tabName\}')"]`)?.classList.add('active');\
                            \}\
\
function toggleSection(header) \{\
                                const sectionContent = header.nextElementSibling;\
                                sectionContent?.classList.toggle('active');\
                            \}\
\
function updatePreference(slider, save = true) \{\
                                const preferenceSpan = slider.nextElementSibling;\
                                const value = parseInt(slider.value);\
                                if (preferenceSpan && preferenceSpan.classList.contains('preference')) \{\
                                    preferenceSpan.textContent = VALUES[value];\
                                    preferenceSpan.style.color = COLORS[value];\
                                \}\
                                if (save) \{\
                                    saveState();\
                                    updateUrl();\
                                \}\
                            \}\
\
function generateCompactState() \{\
                                const meKeys = Array.from(meSliders).map(slider => slider.getAttribute('data-key'));\
                                const partnerKeys = Array.from(partnerSliders).map(slider => slider.getAttribute('data-key'));\
                                const meValues = meKeys.map(key => meSliders[Array.from(meSliders).findIndex(s => s.getAttribute('data-key') === key)].value || '0').join('');\
                                const partnerValues = partnerKeys.map(key => partnerSliders[Array.from(partnerSliders).findIndex(s => s.getAttribute('data-key') === key)].value || '0').join('');\
                                const notes = LZString.compressToBase64(notesTextarea.value || '');\
                                const yourName = LZString.compressToBase64(yourNameInput.value.replace('I am: ', '') || '');\
                                const recipientName = LZString.compressToBase64(recipientNameInput.value.replace('I am sending this to: ', '') || '');\
                                const compact = `$\{meValues\}|$\{partnerValues\}|$\{notes\}|$\{yourName\}|$\{recipientName\}`;\
                                return LZString.compressToBase64(compact);\
                            \}\
\
function decodeCompactState(encoded) \{\
                                const decompressed = LZString.decompressFromBase64(encoded) || '';\
                                const [meValues = '', partnerValues = '', notesCompressed = '', yourNameCompressed = '', recipientNameCompressed = ''] = decompressed.split('|');\
                                const meArray = meValues.split('').map(Number);\
                                const partnerArray = partnerValues.split('').map(Number);\
                                const notes = LZString.decompressFromBase64(notesCompressed) || '';\
                                const yourName = LZString.decompressFromBase64(yourNameCompressed) || '';\
                                const recipientName = LZString.decompressFromBase64(recipientNameCompressed) || '';\
\
                                const mePrefs = \{\};\
                                const partnerPrefs = \{\};\
                                meSliders.forEach((slider, i) => \{\
                                    const key = slider.getAttribute('data-key');\
                                    if (key && i < meArray.length) mePrefs[key] = meArray[i].toString();\
                                \});\
                                partnerSliders.forEach((slider, i) => \{\
                                    const key = slider.getAttribute('data-key');\
                                    if (key && i < partnerArray.length) partnerPrefs[key] = partnerArray[i].toString();\
                                \});\
                                return \{\
                                    me: mePrefs,\
                                    partner: partnerPrefs,\
                                    notes: notes,\
                                    yourName: yourName,\
                                    recipientName: recipientName\
                                \};\
                            \}\
\
function generateState() \{\
                                const mePrefs = \{\};\
                                const partnerPrefs = \{\};\
                                meSliders.forEach(slider => \{\
                                    const key = slider.getAttribute('data-key');\
                                    if (key) mePrefs[key] = slider.value;\
                                \});\
                                partnerSliders.forEach(slider => \{\
                                    const key = slider.getAttribute('data-key');\
                                    if (key) partnerPrefs[key] = slider.value;\
                                \});\
                                return \{\
                                    me: mePrefs,\
                                    partner: partnerPrefs,\
                                    notes: notesTextarea.value || '',\
                                    yourName: yourNameInput.value.replace('I am: ', '') || '',\
                                    recipientName: recipientNameInput.value.replace('I am sending this to: ', '') || ''\
                                \};\
                            \}\
\
function saveState() \{\
                                const state = generateState();\
                                localStorage.setItem(STORAGE_KEY, JSON.stringify(state));\
                                const saveMessage = document.getElementById('saveMessage');\
                                if (saveMessage) \{\
                                    saveMessage.style.opacity = '1';\
                                    setTimeout(() => saveMessage.style.opacity = '0', 2000);\
                                \}\
                            \}\
\
function loadStateFromStorage() \{\
                                const stored = localStorage.getItem(STORAGE_KEY);\
                                return stored ? JSON.parse(stored) : \{\
                                    me: \{\},\
                                    partner: \{\},\
                                    notes: '',\
                                    yourName: '',\
                                    recipientName: ''\
                                \};\
                            \}\
\
function encodeUrlParams() \{\
                                return generateCompactState();\
                            \}\
\
function decodeUrlParams(encoded) \{\
                                return decodeCompactState(encoded);\
                            \}\
\
function updateUrl() \{\
                                const encoded = encodeUrlParams();\
                                const newUrl = `$\{window.location.origin\}$\{window.location.pathname\}#$\{encoded\}`;\
                                window.history.replaceState(\{\}, document.title, newUrl);\
                            \}\
\
function generateUrl() \{\
                                const encoded = encodeUrlParams();\
                                return `$\{window.location.origin\}$\{window.location.pathname\}#$\{encoded\}`;\
                            \}\
\
function shareViaTelegram() \{\
                                window.open(`https://t.me/share/url?url=$\{encodeURIComponent(generateUrl())\}`, '_blank');\
                                showToast('Shared via Telegram');\
                            \}\
\
function shareViaWhatsApp() \{\
                                window.open(`https://wa.me/?text=$\{encodeURIComponent(generateUrl())\}`, '_blank');\
                                showToast('Shared via WhatsApp');\
                            \}\
\
function shareViaEmail() \{\
                                window.location.href = `mailto:?body=$\{encodeURIComponent(generateUrl())\}`;\
                                showToast('Email opened');\
                            \}\
\
function copyUrl() \{\
                                const url = generateUrl();\
                                if (navigator.clipboard?.writeText) \{\
                                    navigator.clipboard.writeText(url).then(() => showToast('URL copied to clipboard')).catch(err => \{\
                                        console.error('Clipboard failed:', err);\
                                        fallbackCopyText(url);\
                                    \});\
                                \} else \{\
                                    fallbackCopyText(url);\
                                \}\
                            \}\
\
function fallbackCopyText(text) \{\
                                const textArea = document.createElement('textarea');\
                                textArea.value = text;\
                                document.body.appendChild(textArea);\
                                textArea.select();\
                                try \{\
                                    document.execCommand('copy');\
                                    showToast('URL copied');\
                                \} catch (err) \{\
                                    showToast('\uc0\u9888 \u65039  Copy failed. Please copy manually.');\
                                \}\
                                document.body.removeChild(textArea);\
                            \}\
\
function loadSliderPositionsAndNotes() \{\
                                try \{\
                                    const hash = window.location.hash.slice(1);\
                                    const urlState = hash ? decodeUrlParams(hash) : \{\};\
                                    const storedState = loadStateFromStorage();\
\
                                    meSliders.forEach(slider => \{\
                                        const key = slider.getAttribute('data-key');\
                                        if (!key) return;\
                                        const urlValue = urlState.me?.[key];\
                                        const storedValue = storedState.me[key];\
                                        const value = urlValue !== undefined ? urlValue : storedValue;\
                                        if (value !== undefined) \{\
                                            slider.value = value;\
                                            updatePreference(slider, false);\
                                        \}\
                                    \});\
\
                                    partnerSliders.forEach(slider => \{\
                                        const key = slider.getAttribute('data-key');\
                                        if (!key) return;\
                                        const urlValue = urlState.partner?.[key];\
                                        const storedValue = storedState.partner[key];\
                                        const value = urlValue !== undefined ? urlValue : storedValue;\
                                        if (value !== undefined) \{\
                                            slider.value = value;\
                                            updatePreference(slider, false);\
                                        \}\
                                    \});\
\
                                    if (notesTextarea && (urlState.notes || storedState.notes)) \{\
                                        notesTextarea.value = urlState.notes || storedState.notes;\
                                    \}\
                                    if (yourNameInput) \{\
                                        yourNameInput.value = 'I am: ' + (urlState.yourName || storedState.yourName || '');\
                                    \}\
                                    if (recipientNameInput) \{\
                                        recipientNameInput.value = 'I am sending this to: ' + (urlState.recipientName || storedState.recipientName || '');\
                                    \}\
                                    updateTabNames(); // Ensure tab names are updated on load\
                                \} catch (error) \{\
                                    console.error('Error loading state:', error);\
                                    showToast('Error loading saved state');\
                                \}\
                            \}\
\
function ensurePrefix(input, prefix) \{\
                                if (!input.value.startsWith(prefix)) \{\
                                    input.value = prefix + input.value;\
                                \}\
                                saveState();\
                                updateUrl();\
                                updateTabNames(); // Update tab names when prefix is ensured\
                            \}\
\
function updateTabNames() \{\
                                const yourName = document.getElementById('yourName').value.replace('I am: ', '').trim();\
                                const partnerName = document.getElementById('recipientName').value.replace('I am sending this to: ', '').trim();\
                                document.getElementById('meTab').textContent = yourName || 'Me';\
                                document.getElementById('partnerTab').textContent = partnerName || 'Partner';\
                            \}\
\
window.onload = function() \{\
                                console.log('Window loaded');\
                                meSliders = document.querySelectorAll('#me .slider');\
                                partnerSliders = document.querySelectorAll('#partner .slider');\
                                notesTextarea = document.getElementById('personalNotes');\
                                yourNameInput = document.getElementById('yourName');\
                                recipientNameInput = document.getElementById('recipientName');\
\
                                if (!meSliders.length && !partnerSliders.length) \{\
                                    console.warn('No sliders found');\
                                    showToast('No sliders found - check HTML');\
                                    return;\
                                \}\
\
                                document.querySelector('#me .section-content')?.classList.add('active');\
                                document.querySelector('#partner .section-content')?.classList.add('active');\
\
                                loadSliderPositionsAndNotes();\
\
                                [meSliders, partnerSliders].forEach(sliderGroup => \{\
                                    sliderGroup.forEach(slider => \{\
                                        slider.addEventListener('input', () => updatePreference(slider));\
                                        slider.addEventListener('touchstart', e => e.preventDefault(), \{\
                                            passive: false\
                                        \});\
                                        slider.addEventListener('touchmove', e => \{\
                                            e.preventDefault();\
                                            const touch = e.touches[0];\
                                            const rect = slider.getBoundingClientRect();\
                                            const value = Math.round((touch.clientX - rect.left) / rect.width * (slider.max - slider.min));\
                                            slider.value = Math.min(Number(slider.max), Math.max(Number(slider.min), value));\
                                            updatePreference(slider);\
                                        \}, \{\
                                            passive: false\
                                        \});\
                                    \});\
                                \});\
\
                                if (notesTextarea) \{\
                                    notesTextarea.addEventListener('input', () => \{\
                                        saveState();\
                                        updateUrl();\
                                    \});\
                                \}\
\
                                if (yourNameInput) \{\
                                    yourNameInput.addEventListener('input', () => ensurePrefix(yourNameInput, 'I am: '));\
                                \}\
\
                                if (recipientNameInput) \{\
                                    recipientNameInput.addEventListener('input', () => ensurePrefix(recipientNameInput, 'I am sending this to: '));\
                                \}\
                            \};\
</script>\
</body>\
</html>}
