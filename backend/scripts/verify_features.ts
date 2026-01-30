import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('--- 1. AUTHENTICATION ---');
    try {
        const loginRes = await fetch('http://localhost:3005/iam/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'admin@agence.com', password: 'password123' })
        });

        if (!loginRes.ok) throw new Error('Login failed: ' + await loginRes.text());
        const { access_token } = await loginRes.json();
        console.log('✅ Logged in. Token received.');

        console.log('\n--- 2. CLIENT CREATION (API -> DB) ---');
        const actorPayload = {
            type: 'INDIVIDUAL',
            firstName: 'Sherlock',
            lastName: 'Holmes',
            email: `sherlock.${Date.now()}@bakerstreet.com`,
            phone: '0600000000',
            address: '221B Baker Street', // <--- TARGET FIELD
            source: 'Investigation',    // <--- TARGET FIELD
            tags: ['DETECTIVE', 'VIP']  // <--- TARGET FIELD
        };

        const createActorRes = await fetch('http://localhost:3005/actors', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${access_token}`
            },
            body: JSON.stringify(actorPayload)
        });

        if (!createActorRes.ok) throw new Error('Create Actor failed: ' + await createActorRes.text());
        const { actorId } = await createActorRes.json();
        console.log(`✅ Actor Created via API. ID: ${actorId}`);

        console.log('\n--- 3. VERIFY CLIENT PERSISTENCE (DB DIRECT QUERY) ---');
        const dbActor = await prisma.actor.findUnique({ where: { id: actorId } });
        console.log('DB Record:', JSON.stringify({
            id: dbActor?.id,
            address: dbActor?.address,
            source: dbActor?.source,
            tags: dbActor?.tags
        }, null, 2));

        if (dbActor?.address === '221B Baker Street') {
            console.log('✅ Address persisted correctly.');
        } else {
            console.error('❌ Address NOT persisted.');
        }

        console.log('\n--- 4. OPPORTUNITY CREATION ---');
        const oppPayload = {
            actorId,
            name: 'The Blue Carbuncle',
            amount: 5000,
            stage: 'NEW',
            probability: 30, // <--- TARGET FIELD
            expectedCloseDate: '2025-12-25T00:00:00.000Z' // <--- TARGET FIELD
        };

        const createOppRes = await fetch('http://localhost:3005/opportunities', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${access_token}`
            },
            body: JSON.stringify(oppPayload)
        });
        if (!createOppRes.ok) throw new Error('Create Opp failed: ' + await createOppRes.text());
        const opp = await createOppRes.json();
        console.log(`✅ Opportunity Created via API. ID: ${opp.id}`);

        console.log('\n--- 5. PIPELINE UPDATE (KANBAN DRAG SIMULATION) ---');
        const updatePayload = {
            stage: 'WON',
            probability: 100
        };

        const updateRes = await fetch(`http://localhost:3005/opportunities/${opp.id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${access_token}`
            },
            body: JSON.stringify(updatePayload)
        });

        if (!updateRes.ok) throw new Error('Update Opp failed: ' + await updateRes.text());
        const updatedOpp = await updateRes.json();
        console.log('API Response (Update):', JSON.stringify({
            stage: updatedOpp.stage,
            probability: updatedOpp.probability
        }, null, 2));

        console.log('\n--- 6. VERIFY OPPORTUNITY PERSISTENCE (DB DIRECT QUERY) ---');
        const dbOpp = await prisma.opportunity.findUnique({ where: { id: opp.id } });
        console.log('DB Record:', JSON.stringify({
            stage: dbOpp?.stage,
            probability: dbOpp?.probability,
            expectedCloseDate: dbOpp?.expectedCloseDate
        }, null, 2));

        if (dbOpp?.stage === 'WON' && dbOpp?.probability === 100) {
            console.log('✅ Stage update persisted correctly.');
        } else {
            console.error('❌ Stage update NOT persisted.');
        }

        console.log('\n--- 7. TASKS (CREATE & DELETE) ---');
        const taskPayload = {
            title: 'Investigate Blue Carbuncle',
            dueDate: new Date().toISOString(),
            priority: 'HIGH',
            actorId: actorId
        };
        const createTaskRes = await fetch('http://localhost:3005/tasks', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${access_token}` },
            body: JSON.stringify(taskPayload)
        });
        if (!createTaskRes.ok) throw new Error('Create Task failed: ' + await createTaskRes.text());
        const task = await createTaskRes.json();
        console.log(`✅ Task Created. ID: ${task.id}`);

        const deleteTaskRes = await fetch(`http://localhost:3005/tasks/${task.id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${access_token}` }
        });
        if (!deleteTaskRes.ok) throw new Error('Delete Task failed: ' + await deleteTaskRes.text());
        console.log('✅ Task Deleted via API.');

        const dbTask = await prisma.task.findUnique({ where: { id: task.id } });
        if (!dbTask) console.log('✅ Task deletion validated in DB.');
        else console.error('❌ Task STILL EXISTS in DB.');


        console.log('\n--- 8. INTERACTIONS/NOTES (CREATE & DELETE) ---');
        const notePayload = {
            type: 'NOTE',
            summary: 'Suspect found.',
            details: 'Goose dealer confirmed details.',
            actorId: actorId
        };
        const createNoteRes = await fetch('http://localhost:3005/interactions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${access_token}` },
            body: JSON.stringify(notePayload)
        });
        if (!createNoteRes.ok) throw new Error('Create Note failed: ' + await createNoteRes.text());
        const note = await createNoteRes.json();
        console.log(`✅ Note Created. ID: ${note.id}`);

        const deleteNoteRes = await fetch(`http://localhost:3005/interactions/${note.id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${access_token}` }
        });
        if (!deleteNoteRes.ok) throw new Error('Delete Note failed: ' + await deleteNoteRes.text());
        console.log('✅ Note Deleted via API.');

        const dbInteraction = await prisma.interaction.findUnique({ where: { id: note.id } });
        if (!dbInteraction) console.log('✅ Note deletion validated in DB.');
        else console.error('❌ Note STILL EXISTS in DB.');


    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
