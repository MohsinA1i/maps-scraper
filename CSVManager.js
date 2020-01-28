let dictionary = {
    name: [],
    rating: [],
    price: [],
    monday_open: [],
    tuesday_open: [],
    wednesday_open: [],
    thursday_open: [],
    friday_open: [],
    saturday_open: [],
    sunday_open: [],
    monday_close: [],
    tuesday_close: [],
    wednesday_close: [],
    thursday_close: [],
    friday_close: [],
    saturday_close: [],
    sunday_close: [],
  }

  exports.AddToCSV = function (result) {
    with (dictionary) {
      name.push(result.name)
      rating.push(result.rating)
      price.push(result.price)
      monday_open.push(result.hours[0].open)
      monday_close.push(result.hours[0].close)
      tuesday_open.push(result.hours[1].open)
      tuesday_close.push(result.hours[1].close)
      wednesday_open.push(result.hours[2].open)
      wednesday_close.push(result.hours[2].close)
      thursday_open.push(result.hours[3].open)
      thursday_close.push(result.hours[3].close)
      friday_open.push(result.hours[4].open)
      friday_close.push(result.hours[4].close)
      saturday_open.push(result.hours[5].open)
      saturday_close.push(result.hours[5].close)
      sunday_open.push(result.hours[6].open)
      sunday_close.push(result.hours[6].close)
    }
  }