import Nacl from 'tweetnacl'
import * as Sdk from '@hashgraph/sdk'
import * as Proto from './proto/messages_pb'
import axios from 'axios'
import Cookie from 'js-cookie'

const getRestAPI = 'http://' + window.location.hostname + ':' + process.env.GET_PORT

const firstnames = ['Liam', 'Noah', 'William', 'James', 'Oliver', 'Benjamin', 'Elijah', 'Lucas', 'Mason', 'Logan', 'Alexander',
  'Ethan', 'Jacob', 'Michael', 'Daniel', 'Henry', 'Jackson', 'Sebastian', 'Aiden', 'Matthew', 'Samuel',
  'David', 'Joseph', 'Carter', 'Owen', 'Wyatt', 'John', 'Jack', 'Luke', 'Jayden', 'Dylan', 'Grayson',
  'Levi', 'Isaac', 'Gabriel', 'Julian', 'Mateo', 'Anthony', 'Jaxon', 'Lincoln', 'Joshua', 'Christopher',
  'Andrew', 'Theodore', 'Caleb', 'Ryan', 'Asher', 'Nathan', 'Thomas', 'Leo', 'Isaiah', 'Charles', 'Josiah',
  'Hudson', 'Christian', 'Hunter', 'Connor', 'Eli', 'Ezra', 'Aaron', 'Landon', 'Adrian', 'Jonathan', 'Nolan',
  'Jeremiah', 'Easton', 'Elias', 'Colton', 'Cameron', 'Carson', 'Robert', 'Angel', 'Maverick', 'Nicholas',
  'Dominic', 'Jaxson', 'Greyson', 'Adam', 'Ian', 'Austin', 'Santiago', 'Jordan', 'Cooper', 'Brayden', 'Roman',
  'Evan', 'Ezekiel', 'Xavier', 'Jose', 'Jace', 'Jameson', 'Leonardo', 'Bryson', 'Axel', 'Everett', 'Parker',
  'Kayden', 'Miles', 'Sawyer', 'Jason', 'Declan']

const lastnames = ['Adams', 'Allen', 'Anderson', 'Baker', 'Campbell', 'Carter', 'Clark', 'Flores', 'Gonzalez',
  'Green', 'Hall', 'Harris', 'Hill', 'Jackson', 'King', 'Lee', 'Lewis', 'Lopez', 'Martin',
  'Mitchell', 'Moore', 'Nelson', 'Nguyen', 'Perez', 'Ramirez', 'Rivera', 'Roberts',
  'Robinson', 'Sanchez', 'Scott', 'Taylor', 'Thomas', 'Thompson', 'Torres', 'Walker',
  'White', 'Wilson', 'Wright', 'Young', 'Brown', 'Davis', 'Garcia', 'Hernandez',
  'Johnson', 'Jones', 'Martinez', 'Miller', 'Rodriguez', 'Smith', 'Williams']

export default {
  getRandomFirstName () {
    const index = Math.floor(Math.random() * Math.floor(firstnames.length))
    return firstnames[index]
  },
  getRandomLastName () {
    const index = Math.floor(Math.random() * Math.floor(lastnames.length))
    return lastnames[index]
  },
  getRandomId () {
    return (Math.random().toString(36) + '00000000000000000').slice(2, 9).toUpperCase()
  },
  getBalance () {
    return new Promise(function (resolve, reject) {
      const username = Cookie.get('userName')
      if ((typeof (username) === 'undefined') || (username === '')) {
        resolve(0)
      } else {
        axios.get(getRestAPI.concat('/v1/token/balance/' + username))
          .then(response => {
            resolve(response.data)
          })
          .catch(e => {
            console.log(e)
            resolve(0)
          })
      }
    })
  },
  toHexString (byteArray) {
    const chars = new Uint8Array(byteArray.length * 2)
    const alpha = 'a'.charCodeAt(0) - 10
    const digit = '0'.charCodeAt(0)

    let p = 0
    for (let i = 0; i < byteArray.length; i++) {
      let nibble = byteArray[i] >>> 4
      chars[p++] = nibble > 9 ? nibble + alpha : nibble + digit
      nibble = byteArray[i] & 0xF
      chars[p++] = nibble > 9 ? nibble + alpha : nibble + digit
    }
    return String.fromCharCode.apply(null, chars)
  },
  primitiveHeader (toSign, privateKey) {
    const rand = Math.floor(Math.random() * 10000000)
    const randomString = rand.toString()

    // concatenate random long with data to sign
    const randomBytes = new TextEncoder('utf-8').encode(randomString)
    const signMe = Int8Array.from([...toSign, ...randomBytes])

    // const signMe = toSign.concat(new TextEncoder('utf-8').encode(randomString))

    const edPrivateKey = Sdk.Ed25519PrivateKey.fromString(privateKey)
    const publicKey = edPrivateKey.publicKey.toString()

    const signature = Nacl.sign.detached(Uint8Array.from(signMe)
      , edPrivateKey._keyData)

    const primitiveHeader = new Proto.PrimitiveHeader()
    primitiveHeader.setRandom(rand)
    primitiveHeader.setSignature(signature)
    primitiveHeader.setPublickey(publicKey)

    return primitiveHeader
  },
  resetCookies () {
    Cookie.set('tokenName', '')
    Cookie.set('tokenSymbol', '')
    Cookie.set('tokenDecimals', '')
    Cookie.set('userName', '')
    Cookie.set('userKey', '')
    Cookie.set('friendlyName', '')
    Cookie.set('isAdmin', '')
  }
}
