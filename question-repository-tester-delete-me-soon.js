var questionsRepository = require('./questionsRepository');

questionsRepository.getTopics(function(err, data) {
  if(err) {
    throw err;
  }

  console.log(data);
});