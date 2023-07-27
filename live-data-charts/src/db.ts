import mongoose from 'mongoose';

const mongoURI = 'your-mongodb-connection-string';

// Set the options using mongoose.set()
mongoose.set('useNewUrlParser', true);
mongoose.set('useUnifiedTopology', true);

mongoose.connect(mongoURI)
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
  });
