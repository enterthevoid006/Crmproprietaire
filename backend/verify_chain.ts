
const API_URL = 'http://localhost:3000';

async function verify() {
    try {
        console.log('1. Attempting Login...');
        const loginRes = await fetch(`${API_URL}/iam/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'admin@agence.com',
                password: 'password123'
            })
        });

        if (!loginRes.ok) {
            throw new Error(`Login failed: ${loginRes.status} ${loginRes.statusText}`);
        }

        const loginData = await loginRes.json();
        const token = loginData.accessToken; // Now matches backend
        if (!token) throw new Error('Login response missing accessToken');
        console.log('   Login successful. Token received:', token.substring(0, 10) + '...');

        console.log('2. Fetching Opportunities...');
        const oppsRes = await fetch(`${API_URL}/opportunities`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        if (!oppsRes.ok) {
            throw new Error(`Fetch failed: ${oppsRes.status} ${oppsRes.statusText}`);
        }

        const oppsData = await oppsRes.json();
        console.log(`   Fetched ${oppsData.length} opportunities.`);

        if (oppsData.length > 0) {
            const first = oppsData[0];
            console.log('3. Inspecting First Opportunity payload:');
            console.log(JSON.stringify(first, null, 2));

            // Check for flattened structure
            if (first.stage && first.actor && first.actor.companyName !== undefined) {
                console.log('   SUCCESS: Payload contains Stage and Actor data.');
            } else {
                console.log('   WARNING: Payload might be missing fields! Check JSON above.');
            }
        } else {
            console.log('   No opportunities to inspect.');
        }

    } catch (error: any) {
        console.error('FAILED:', error.message);
    }
}

verify();
