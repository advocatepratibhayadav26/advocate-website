(function () {
  // ---------- Accordion ----------
  document.querySelectorAll('.checklist-header').forEach((header) => {
    header.addEventListener('click', () => {
      header.closest('.checklist-item-group').classList.toggle('open');
    });
  });

  function todayStr() {
    return new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });
  }

  function val(id) {
    const el = document.getElementById(id);
    return el ? el.value.trim() : '';
  }

  // ---------- Generic wiring for a form -> preview -> print ----------
  function wireForm(formId, buildTextFn) {
    const form = document.getElementById(formId);
    if (!form) return;
    const group = form.closest('.checklist-item-group');
    const previewWrap = group.querySelector('.form-preview-wrap');
    const previewEl = previewWrap.querySelector('.generator-preview');
    const printBtn = previewWrap.querySelector('.print-form-btn');
    const editBtn = previewWrap.querySelector('.edit-form-btn');

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      previewEl.textContent = buildTextFn();
      form.hidden = true;
      previewWrap.hidden = false;
      previewWrap.scrollIntoView({ behavior: 'smooth' });
    });

    editBtn.addEventListener('click', () => {
      previewWrap.hidden = true;
      form.hidden = false;
      form.scrollIntoView({ behavior: 'smooth' });
    });

    printBtn.addEventListener('click', () => {
      document.getElementById('printArea').textContent = previewEl.textContent;
      window.print();
    });
  }

  // ---------- 1. Affidavit ----------
  wireForm('affidavitForm', () => {
    const name = val('affName');
    const parent = val('affParent');
    const age = val('affAge');
    const address = val('affAddress');
    const content = val('affContent');
    const place = val('affPlace');

    return `शपथ पत्र (AFFIDAVIT)

मैं, ${name}, पुत्र/पत्नी ${parent}, उम्र ${age} वर्ष, निवासी ${address}, सत्यनिष्ठा से शपथपूर्वक निम्नलिखित कथन करता/करती हूँ:

1. ${content}

2. यह कि उपरोक्त कथन मेरी जानकारी और विश्वास के अनुसार सत्य है, और इसका कोई भाग असत्य नहीं है।

दिनांक: ${todayStr()}
स्थान: ${place}

डिपोनेंट (Deponent)
${name}
हस्ताक्षर: ___________________`;
  });

  // ---------- 2. General Power of Attorney ----------
  wireForm('poaForm', () => {
    const execName = val('poaExecutantName');
    const execAddress = val('poaExecutantAddress');
    const attName = val('poaAttorneyName');
    const attAddress = val('poaAttorneyAddress');
    const powers = val('poaPowers');
    const place = val('poaPlace');

    return `साधारण मुख्तारनामा (GENERAL POWER OF ATTORNEY)

मैं, ${execName}, निवासी ${execAddress}, द्वारा एतद्द्वारा ${attName}, निवासी ${attAddress}, को अपना सामान्य मुख्तार नियुक्त करता/करती हूँ और उन्हें निम्नलिखित कार्य करने का अधिकार प्रदान करता/करती हूँ:

1. ${powers}

मैं इस मुख्तारनामे के अंतर्गत उपरोक्त मुख्तार द्वारा किए गए सभी वैध कार्यों की पुष्टि करता/करती हूँ।

दिनांक: ${todayStr()}
स्थान: ${place}

निष्पादक (Executant)
${execName}
हस्ताक्षर: ___________________`;
  });

  // ---------- 3. Rent Agreement ----------
  wireForm('rentForm', () => {
    const landlordName = val('rentLandlordName');
    const landlordAddress = val('rentLandlordAddress');
    const tenantName = val('rentTenantName');
    const tenantAddress = val('rentTenantAddress');
    const propertyAddress = val('rentPropertyAddress');
    const amount = val('rentAmount');
    const deposit = val('rentDeposit');
    const startDateRaw = val('rentStartDate');
    const startDate = startDateRaw ? new Date(startDateRaw).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }) : '';
    const duration = val('rentDuration');
    const place = val('rentPlace');

    return `किरायानामा (RENT AGREEMENT)

यह किरायानामा दिनांक ${todayStr()} को निम्नलिखित पक्षों के बीच निष्पादित किया गया:

मकान मालिक (Landlord): ${landlordName}, निवासी ${landlordAddress}
किरायेदार (Tenant): ${tenantName}, निवासी ${tenantAddress}

1. मकान मालिक किरायेदार को संपत्ति "${propertyAddress}" मासिक किराए पर देने हेतु सहमत हैं।
2. मासिक किराया: रु. ${amount}/- प्रतिमाह।
3. सुरक्षा जमा राशि (Security Deposit): रु. ${deposit}/-
4. यह किरायानामा दिनांक ${startDate} से ${duration} महीनों के लिए प्रभावी रहेगा।
5. किरायेदार संपत्ति का उपयोग केवल पारस्परिक रूप से सहमत प्रयोजन हेतु करेगा।
6. किसी भी विवाद की स्थिति में यह किरायानामा स्थानीय किरायादारी कानूनों के अधीन होगा।

दिनांक: ${todayStr()}
स्थान: ${place}

मकान मालिक हस्ताक्षर: ___________________
किरायेदार हस्ताक्षर: ___________________
गवाह 1: ___________________
गवाह 2: ___________________`;
  });
})();
