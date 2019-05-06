const bcrypt = require('bcryptjs');
const Event = require('../../models/event');
const User = require('../../models/user');

const findEventsByIds = async (eventIds) => {
  try {
    const events = await Event.find({ _id: {$in: eventIds}});
    return events.map(event => ({...event._doc, creator: findAUser(event.creator), date: new Date(event.date).toISOString()}))
  } catch(error) {
    throw new Error(error);
  }
}

const findAUser = async (userId) => {
  try {
    const user = await User.findById(userId);
    return { ...user._doc, password: null, createdEvents: findEventsByIds(user._doc.createdEvents) };
  } catch(error) {
    throw new Error(error);
  }
};

module.exports = {
  async events(args) {
    try {
      const events = await Event.find();
      return events.map(event => ({...event._doc, creator: findAUser(event._doc.creator), date: new Date(event.date).toISOString()}));
    } catch(error) {
      throw new Error(error);
    }
  },
  async createEvent({eventInput}) {
    try {
      const { title, description, price, date } = eventInput;
      const event = new Event({
        title,
        description,
        price,
        date: new Date(date),
        creator: '5ccf14df02ccdfafc7c635e0',
      });
      const savedEvent = await event.save();
      const user = await User.findById('5ccf14df02ccdfafc7c635e0');
      if (!user) throw new Error('User does not exist!');
      user.createdEvents.push(event);
      await user.save();
      return {...savedEvent._doc, creator: findAUser(event._doc.creator), date: new Date(event.date).toISOString()};
    } catch(error) {
      throw new Error(error);
    }
  },
  async createUser({userInput}) {
    try {
      const { email, password } = userInput;
      const doesSameEmailExist = await User.findOne({email});
      if (doesSameEmailExist) {
        throw new Error('User already exists.');
      }
      const hashedPassword = await bcrypt.hash(password, 12);
      const user = new User({
        email,
        password: hashedPassword
      });
      const savedUser = await user.save();
      return { ...savedUser._doc, password: null };
    } catch(error) {
      throw new Error(error);
    }
  }
};
