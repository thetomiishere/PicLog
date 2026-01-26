
export const calendarService = async (filters = {}) => {
    const response = {
        success: true,
        imageUrl: "URL.createObjectURL(file)"
    };
    return response;
    const API_URL = await loadUrl() + suffix;
    const queryParts = [];
    for (const key in filters) {
        const value = filters[key];

        if (Array.isArray(value)) {
            if (value.length > 0) {
                queryParts.push(`${key}=${value.join('+')}`);
            }
        } else if (value !== undefined && value !== "") {
            queryParts.push(`${key}=${encodeURIComponent(value)}`);
        }
    }
    //console.log(filters);
    const queryString = queryParts.length > 0 ? `?${queryParts.join('&')}` : "";
    const url = `${API_URL}${queryString}`;
    try {
        const response = await fetch(url, { method: 'GET' });
        //console.log(await response.text());
        if (!response.ok) throw new Error('Failed to fetch files');
        return await response.json();
    } catch (err) {
        console.error('Error in getFiles:', err);
        throw err;
    }
};

export const addCell = async (date, file) => {
    const response = {
        success: true,
        imageUrl: "URL.createObjectURL(file)"
    };
    return response;
    console.log("Service: Uploading to Firebase...", { date, file, intensity });
    
    return {
        success: true,
        imageUrl: URL.createObjectURL(file),
        intensity: intensity
    };
};

export const uploadEntry = async (file) => {
    return;
    console.log("Service: Uploading to Firebase...", { date, file, intensity });
    
    return {
        success: true,
        imageUrl: URL.createObjectURL(file),
        intensity: intensity
    };
};

export const fetchEntries = async (month, year) => {
    return;
    console.log("Service: Uploading to Firebase...", { date, file, intensity });
    
    return {
        success: true,
        imageUrl: URL.createObjectURL(file),
        intensity: intensity
    };
};
