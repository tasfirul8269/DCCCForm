interface FormSubmissionData {
  nameBengali: string;
  nameEnglish: string;
  category: string;
  email: string;
  phoneNumber: string;
  whatsappNumber: string;
  institution: string;
  class: string;
  image1: string;
  image2: string;
  image3: string;
}

export const submitToGoogleSheets = async (
  data: FormSubmissionData,
  scriptUrl: string
): Promise<boolean> => {
  try {
    await fetch(scriptUrl, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    return true;
  } catch (error) {
    console.error('Google Sheets submission error:', error);
    throw error;
  }
};
