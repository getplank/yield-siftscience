'use strict'; //jshint -W097

var config      = require('./config.js');
var express     = require('express');
var bodyParser  = require('body-parser');

//In v204 of API return_action is deprecated in favor of return_score, return_workflow_status & abuse_types
var siftscience = require('../lib/app.js')({
  api_key:       config.api_key,
  account_id:    config.account_id,
  partner_id:    config.account_id,
  custom_events: ['custom_event_1', 'custom_event_2','create_custom_order'],
  // return_action: true,
  return_score: true,
  // return_workflow_status: true,
  abuse_types: ['payment_abuse', 'promo_abuse'],
  webhooks: {
    all: function(req, res, done) {
      console.log('all: ', req.body, '\n');
      done();
    },
    test: function(req, res, done) {
      console.log('test: ', req.body, '\n');
      done();
    },
    not: function(req, res, done) {
      console.log('not: ', req.body, '\n');
      done();
    }
  }
});

//
// Run a bunch of test requests
//

var session_id = 'SESSION-' + Date.now(),
    user_id    = 'USER-' + Date.now();
var order_id = 'ORDER-' + Date.now();

// function init() {
//   create_account()
//     // .then(update_account)
//     // .then(login)
//     // .then(update_content)
//     .then(create_order)
//     // .then(create_custom_order)
//     // .then(custom_event_1)
//     // .then(label)
//     // .then(score)
//     // .then(fingerprint_get_devices)
//     // .then(fingerprint_get_session)
//     // .then(fingerprint_get_device)
//     // .then(fingerprint_label_device)
//     // .then(partner_create_account)
//     // .then(partner_list_accounts)
//     // .then(partner_configure_notifications)
//     .then(start_test_server)
//   ;
// }

function init() {
  create_account()
    .then (create_order)
    .delay(5000)
    .then(order_decisions)
    .then(start_test_server);

}

init();

function create_account() {
  return siftscience.event.create_account({
    '$session_id': session_id,
    '$user_id':    user_id,
    '$user_email': 'test@email.com',
    '$name':       'Test',
    '$phone':      '123-456-7890'
  })
  .then(function(response) {
    console.log('CREATE ACCOUNT: ', siftscience.CONSTANTS.RESPONSE_STATUS_MESSAGE[response.status], '\n\n', JSON.stringify(response, null, 2), '\n');
  })
  .catch(function(err) {
    console.log('CREATE ACCOUNT ERROR: ', err, '\n');
    throw err;
  });
}

function update_account() {
  return siftscience.event.update_account({
    '$session_id': session_id,
    '$user_id':    user_id,
    '$user_email': 'test@email.com',
    '$name':       'Test',
    '$phone':      '123-456-7890'
  })
  .then(function(response) {
    console.log('UPDATE ACCOUNT: ', siftscience.CONSTANTS.RESPONSE_STATUS_MESSAGE[response.status], '\n\n', JSON.stringify(response, null, 2), '\n');
  })
  .catch(function(err) {
    console.log('UPDATE ACCOUNT ERROR: ', err, '\n');
    throw err;
  });
}

function update_content() {
  return siftscience.event.update_content({
      // Required Fields
      "$user_id"    : user_id,

      // Supported Fields
      "$contact_email"    : "bill@example.com",
      "$contact_phone"    : "1-415-555-6040",
      "$content_id"       : "9671500641",
      "$subject"          : "2 Bedroom Apartment for Rent",
      "$content"          : "Capitol Hill Seattle brand new condo. 2 bedrooms and 1 full bath.",
      "$amount"           : 2300000000, // $2300
      "$currency_code"    : "USD",
      "$categories"       : [
        "Housing",
        "Apartments",
        "2 Bedrooms"
      ],

    "$locations"        : [
        {
          "$city"       : "Seattle",
          "$region"     : "Washington",
          "$country"    : "US",
          "$zipcode"    : "98112"
        }
      ],
      "$image_hashes"     : [
        "912ec803b2ce49e4a541068d495ab570", // MD5 hash of the image
        "4be4b314caafaa3e12bfcb8d16df3aff"
      ],
      "$expiration_time"  : 1471003200000, // UNIX timestamp in milliseconds
      "$status"           : "$active"
    }
  )
  .then(function(response) {
    console.log('UPDATE CONTENT: ', siftscience.CONSTANTS.RESPONSE_STATUS_MESSAGE[response.status], '\n\n', JSON.stringify(response, null, 2), '\n');
  })
  .catch(function(err) {
    console.log('UPDATE CONTENT ERROR: ', err, '\n');
    throw err;
  });

}

function login() {
  return siftscience.event.login({
    '$session_id':   session_id,
    '$user_id':      user_id,
    '$login_status': siftscience.CONSTANTS.STATUS.SUCCESS
  })
  .then(function(response) {
    console.log('LOGIN: ', siftscience.CONSTANTS.RESPONSE_STATUS_MESSAGE[response.status], '\n\n', JSON.stringify(response, null, 2), '\n');
  })
  .catch(function(err) {
    console.log('LOGIN ERROR: ', err, '\n');
    throw err;
  });
}

function create_order() {
  return siftscience.event.create_order(// Sample $create_order event
    {
      // Required Fields
      "$user_id"          : user_id,
      // Supported Fields
      "$session_id"       : session_id,
      "$order_id"         : order_id ,
      "$user_email"       : "bill@gmail.com",
      "$amount"           : 115940000, // $115.94
      "$currency_code"    : "USD",
      "$billing_address"  : {
        "$name"         : "Bill Jones",
        "$phone"        : "1-415-555-6041",
        "$address_1"    : "2100 Main Street",
        "$address_2"    : "Apt 3B",
        "$city"         : "New London",
        "$region"       : "New Hampshire",
        "$country"      : "US",
        "$zipcode"      : "03257"
      },
      "$payment_methods"  : [
        {
          "$payment_type"    : "$credit_card",
          "$payment_gateway" : "$braintree",
          "$card_bin"        : "542486",
          "$card_last4"      : "4444"
        }
      ],
      "$shipping_address"  : {
        "$name"          : "Bill Jones",
        "$phone"         : "1-415-555-6041",
        "$address_1"     : "2100 Main Street",
        "$address_2"     : "Apt 3B",
        "$city"          : "New London",
        "$region"        : "New Hampshire",
        "$country"       : "US",
        "$zipcode"       : "03257"
      },
      "$expedited_shipping" : true,
      "$shipping_method"    : "$electronic",
      "$items"             : [
        {
          "$item_id"        : "12344321",
          "$product_title"  : "Microwavable Kettle Corn: Original Flavor",
          "$price"          : 4990000, // $4.99
          "$upc"            : "097564307560",
          "$sku"            : "03586005",
          "$brand"          : "Peters Kettle Corn",
          "$manufacturer"   : "Peters Kettle Corn",
          "$category"       : "Food and Grocery",
          "$tags"           : ["Popcorn", "Snacks", "On Sale"],
          "$quantity"       : 4
        },
        {
          "$item_id"        : "B004834GQO",
          "$product_title"  : "The Slanket Blanket-Texas Tea",
          "$price"          : 39990000, // $39.99
          "$upc"            : "67862114510011",
          "$sku"            : "004834GQ",
          "$brand"          : "Slanket",
          "$manufacturer"   : "Slanket",
          "$category"       : "Blankets & Throws",
          "$tags"           : ["Awesome", "Wintertime specials"],
          "$color"          : "Texas Tea",
          "$quantity"       : 2
        }
      ],

      // For marketplaces, use $seller_user_id to identify the seller
      "$seller_user_id"     : "slinkys_emporium",

      "$promotions"         : [
        {
          "$promotion_id" : "FirstTimeBuyer",
          "$status"       : "$success",
          "$description"  : "$5 off",
          "$discount"     : {
            "$amount"                   : 5000000,  // $5.00
            "$currency_code"            : "USD",
            "$minimum_purchase_amount"  : 25000000  // $25.00
          }
        }
      ],

      // Sample Custom Fields
      "digital_wallet"      : "apple_pay", // "google_wallet", etc. 
      "coupon_code"         : "dollarMadness",
      "shipping_choice"     : "FedEx Ground Courier",
      "is_first_time_buyer" : false
    }
  )
  .then(function(response) {
    console.log('CREATE_ORDER: ', siftscience.CONSTANTS.RESPONSE_STATUS_MESSAGE[response.status], '\n\n', JSON.stringify(response, null, 2), '\n');
  })
  .catch(function(err) {
    console.log('CREATE_ORDER ERROR: ', err, '\n');
    throw err;
  });
}

function create_custom_order() {
  return siftscience.event.create_custom_order(// Sample $create_order event
    {
      // Required Fields
      "$user_id"          : user_id,
      // Supported Fields
      "$session_id"       : session_id,
      "$order_id"         : "ORDER-28168442" + Date.now(),
      "$user_email"       : "bill@gmail.com",
      "$amount"           : 115940000, // $115.94
      "$currency_code"    : "USD",
      "$payment_type"     : "$crypto_currency",
      // For marketplaces, use $seller_user_id to identify the seller
      "$seller_user_id"     : "slinkys_emporium",

    }
  )
  .then(function(response) {
    console.log('CREATE_ORDER: ', siftscience.CONSTANTS.RESPONSE_STATUS_MESSAGE[response.status], '\n\n', JSON.stringify(response, null, 2), '\n');
  })
  .catch(function(err) {
    console.log('CREATE_ORDER ERROR: ', err, '\n');
    throw err;
  });
}

function custom_event_1() {
  return siftscience.event.custom_event_1({
    '$session_id': session_id,
    '$user_id':    user_id,
    'custom_1':    'custom 1',
    'custom_2':    'custom 2'
  })
  .then(function(response) {
    console.log('CUSTOM EVENT 1: ', siftscience.CONSTANTS.RESPONSE_STATUS_MESSAGE[response.status], '\n\n', JSON.stringify(response, null, 2), '\n');
    return response;
  })
  .catch(function(err) {
    console.log('CUSTOM EVENT 1 ERROR: ', err, '\n');
    throw err;
  });
}

function label() {
  return siftscience.label(user_id, {
    '$description': 'Spamming and fraud',
    '$reasons':     [siftscience.CONSTANTS.REASON.CHARGEBACK, siftscience.CONSTANTS.REASON.SPAM],
    '$is_bad':      true
  })
  .then(function(response) {
    console.log('LABEL: ', siftscience.CONSTANTS.RESPONSE_STATUS_MESSAGE[response.status], '\n\n', JSON.stringify(response, null, 2), '\n');
    return response;
  })
  .catch(function(err) {
    console.log('LABEL ERROR: ', err, '\n');
    throw err;
  });
}

function score() {
  return siftscience.score(user_id)
  .then(function(response) {
    console.log('SCORE: ', siftscience.CONSTANTS.RESPONSE_STATUS_MESSAGE[response.status], '\n\n', JSON.stringify(response, null, 2), '\n');
    return response;
  })
  .catch(function(err) {
    console.log('SCORE ERROR: ', err, '\n');
    throw err;
  });
}

function user_decisions() {
  return siftscience.user_decisions(user_id)
    .then(function(response) {
      console.log('USER DECISION: ', siftscience.CONSTANTS.RESPONSE_STATUS_MESSAGE[response.status], '\n\n', JSON.stringify(response, null, 2), '\n');
      return response;
    })
    .catch(function(err) {
      console.log('USER DECISION ERROR: ', err, '\n');
      throw err;
    });
  
}

function order_decisions() {
  return siftscience.order_decisions(order_id)
    .then(function(response) {
      console.log('ORDER DECISION: ', siftscience.CONSTANTS.RESPONSE_STATUS_MESSAGE[response.status], '\n\n', JSON.stringify(response, null, 2), '\n');
      return response;
    })
    .catch(function(err) {
      console.log('ORDER DECISION ERROR: ', err, '\n');
      throw err;
    });
  
}

function fingerprint_get_devices() {
  return siftscience.fingerprint.get_devices(user_id)
  .then(function(response) {
    console.log('GET DEVICES: ', response, '\n');
    return response;
  })
  .catch(function(err) {
    console.log('GET DEVICES ERROR: ', err, '\n');
    throw err;
  });
}

function fingerprint_get_session() {
  return siftscience.fingerprint.get_session(session_id)
  .then(function(response) {
    console.log('SESSION: ', response, '\n');
    return response;
  })
  .catch(function(err) {
    console.log('SESSION ERROR: ', err, '\n');
    throw err;
  });
}

function fingerprint_get_device(_response) {
  return siftscience.fingerprint.get_device(_response.device.id)
  .then(function(response) {
    console.log('GET DEVICE: ', response, '\n');
    return response;
  })
  .catch(function(err) {
    console.log('GET DEVICE ERROR: ', err, '\n');
    throw err;
  });
}

function fingerprint_label_device(_response) {
  return siftscience.fingerprint.label_device(_response.id, siftscience.CONSTANTS.DEVICE_LABEL.BAD)
  .then(function(response) {
    console.log('LABEL DEVICE: ', response, '\n');
    return response;
  })
  .catch(function(err) {
    console.log('LABEL DEVICE ERROR: ', err, '\n');
    throw err;
  });
}

function partner_create_account() {
  return siftscience.partner.create_account({
    site_url:      'merchant123.com',
    site_email:    'owner@merchant123.com',
    analyst_email: 'john.doe@merchant123.com',
    password:      's0mepA55word'
  })
  .then(function(response) {
    console.log('CREATE PARTNER ACCOUNT: ', response, '\n');
    return response;
  })
  .catch(function(err) {
    console.log('CREATE PARTNER ACCOUNT ERROR: ', err, '\n');
    throw err;
  });
}

function partner_list_accounts() {
  return siftscience.partner.list_accounts()
  .then(function(response) {
    console.log('LIST PARTNER ACCOUNTS: ', response, '\n');
    return response;
  })
  .catch(function(err) {
    console.log('LIST PARTNER ACCOUNTS ERROR: ', err, '\n');
    throw err;
  });
}

function partner_configure_notifications() {
  return siftscience.partner.configure_notifications({
    email_notification_threshold: 0.5,
    http_notification_threshold:  0.5,
    http_notification_url:        'https://api.partner.com/notify?account=%s'
  })
  .then(function(response) {
    console.log('CONFIGURE NOTIFICATIONS: ', response, '\n');
    return response;
  })
  .catch(function(err) {
    console.log('CONFIGURE NOTIFICATIONS ERROR: ', err, '\n');
    throw err;
  });
}

function start_test_server() {
  var app = express();

  app.get('/', function (req, res) {
    res.send('<!DOCTYPE html><head><script type="text/javascript">var _sift=_sift||[];_sift.push(["_setAccount","' + config.js_key + '"]);_sift.push(["_setSessionId","' + session_id + '"]);_sift.push(["_setUserId","' + user_id + '"]);_sift.push(["_trackPageview"]);(function(){function ls(){var e=document.createElement("script");e.type="text/javascript";e.async=true;e.src=("https:"==document.location.protocol?"https://":"http://")+"cdn.siftscience.com/s.js";var s=document.getElementsByTagName("script")[0];s.parentNode.insertBefore(e,s);}if(window.attachEvent){window.attachEvent("onload",ls);}else{window.addEventListener("load",ls,false);}})();</script></head><body><p>yield-siftscience test page</p></body></html>');
  });

  app.post('/siftscience', bodyParser.json(), siftscience.webhook.express());

  var server = app.listen(config.port, config.host, function () {
    var host = server.address().address;
    var port = server.address().port;

    console.log('Test app listening at http://' + host + ':' + port, '\n');
  });
}
