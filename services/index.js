const fastify = require('fastify')({ logger: true });
const listenMock = require('../mock-server');

fastify.get('/getUsers', async (request, reply) => {
    const resp = await fetch('http://event.com/getUsers');
    const data = await resp.json();
    reply.send(data); 
});

fastify.post('/addEvent', async (request, reply) => {
  try {
    const resp = await fetch('http://event.com/addEvent', {
      method: 'POST',
      body: JSON.stringify({
        id: new Date().getTime(),
        ...request.body
      })
    });
    const data = await resp.json();
    reply.send(data);
  } catch(err) {
    reply.error(err);
  }
});

fastify.get('/getEvents', async (request, reply) => {  
    const resp = await fetch('http://event.com/getEvents');
    const data = await resp.json();
    reply.send(data);
});

fastify.get('/getEventsByUserId/:id', async (request, reply) => {
    const { id } = request.params;
    const user = await fetch('http://event.com/getUserById/' + id);
    const userData = await user.json();

    // Create an array of Promises for parallel queries
    const eventPromises = userData.events.map(eventId => 
      fetch('http://event.com/getEventById/' + eventId).then(res => res.json())
    );
    
    // Launch all requests at the same time
    const eventArray = await Promise.all(eventPromises);
    reply.send(eventArray);
});

fastify.listen({ port: 3000 }, (err) => {
    listenMock();
    if (err) {
      fastify.log.error(err);
      process.exit();
    }
});
