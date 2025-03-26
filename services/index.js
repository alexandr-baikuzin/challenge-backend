const fastify = require('fastify')({ logger: true });
const listenMock = require('../mock-server');

fastify.get('/getUsers', async (request, reply) => {
    const resp = await fetch('http://event.com/getUsers');
    const data = await resp.json();
    reply.send(data); 
});

fastify.post('/addEvent', async (request, reply) => {
  try {
    const resp = await circuitBreaker.execute(() => addEventRequest(request));
    reply.send(resp);
  } catch (error) {
    reply.status(503).send({
      success: false,
      error: 'Service temporarily unavailable',
      message: error.message
    });
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

async function addEventRequest(request) {
  return fetchWithRetry('http://event.com/addEvent', {
      method: 'POST',
      body: JSON.stringify({
        id: new Date().getTime(),
        ...request.body
      })
  });
}

async function fetchWithRetry(url, options, maxRetries = 3) {
  let lastError;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
      // console.log(`Attempt ${attempt}/${maxRetries}`);
      try {
          const response = await fetch(url, options);
          if (response.ok) return await response.json();
          throw new Error(`Service unavailable (HTTP ${response.status})`);
      } catch (error) {
          lastError = error;
          if (attempt < maxRetries) {
              const delay = Math.pow(2, attempt) * 100;
              // console.log(`Waiting ${delay}ms...`);
              await new Promise(resolve => setTimeout(resolve, delay));
          }
      }
  }
  throw lastError;
}

const circuitBreaker = {
  state: 'CLOSED',
  failureCount: 0,
  lastFailure: 0,
  threshold: 3,         // 3 Errors - Closing the chain
  resetTimeout: 30000,  // 30 seconds in Open condition

  async execute(fn) {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailure < this.resetTimeout) {
        throw new Error('CircuitBreaker: Active');
      }
      this.state = 'HALF_OPEN';
    }

    try {
      const result = await fn();
      this.reset();
      return result;
    } catch (error) {
      this.recordFailure();
      throw error;
    }
  },

  recordFailure() {
    this.failureCount++;
    this.lastFailure = Date.now();
    if (this.failureCount >= this.threshold || this.state === 'HALF_OPEN') {
      this.state = 'OPEN';
      setTimeout(() => this.state = 'HALF_OPEN', this.resetTimeout);
    }
  },

  reset() {
    this.state = 'CLOSED';
    this.failureCount = 0;
  }
};