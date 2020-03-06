const fs = require('fs');

const tours = JSON.parse(fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`));

exports.checkID = (req, res, next, val) => {
  console.log(val);
  if (req.params.id * 1 > tours.length) {
    return res.status(404).json({
      status: 'Fail',
      message: 'Invalid Id'
    });
  }
  next();
}

exports.checkBody = (req, res, next) => {
  if(!req.body.name || !req.body.price) {
    return res.status(400).json({
      status: 'Fail',
      message: 'Missing name or price'
    })
  }
  next();
}

// Grt All Tours
exports.getAllTours = (req, res) => {
  res.status(200).json({
    status: 'success',
    requestedAt: req.requestTime,
    result: tours.length,
    data: {
      tours
    }
  });
}

// Get one Tour
exports.getTour = (req, res) => {
  console.log(req.params);
  const id = req.params.id * 1;

  const tour = tours.find(el => el.id === id);

  res.status(200).json({
    status: 'success',
    data: {
      tour
    }
  });
}


// Add Tours
exports.createTour = (req, res) => {
  res.send('done');
}

// Update Tour
exports.updateTour = (req, res) => {
  res.status(200).json({
    status: 'success',
    data: 'Updated tour ...'
  })
}

// Delete Tour
exports.deleteTour = (req, res) => {
  res.status(204).json({
    status: 'success',
    data: null
  })
}