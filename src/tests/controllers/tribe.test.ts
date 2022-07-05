import test, { ExecutionContext } from 'ava'
import nodes from '../nodes'
import { leaveTribe, deleteTribe } from '../utils/del'
import { createTribe, joinTribe } from '../utils/save'
import { randomText, iterate } from '../utils/helpers'
import { NodeConfig } from '../types'
import {sendTribeMessageAndCheckDecryption} from '../utils/msg'
import * as mqtt from 'mqtt'
import {genSignedTimestamp} from "../../utils/tribes";
import { loadConfig } from '../../utils/config'
/*
    npx ava src/tests/controllers/tribe.test.ts --verbose --serial --timeout=2m
*/

interface Context {}
const config  = loadConfig()

test.serial('tribe', async (t: ExecutionContext<Context>) => {
  t.true(Array.isArray(nodes))
  await iterate(nodes, async (node1, node2) => {
    await tribeTest(t, node1, node2)
  })
})

async function tribeTest(
  t: ExecutionContext<Context>,
  node1: NodeConfig,
  node2: NodeConfig
) {
  //NODE1 CREATES A TRIBE
  let tribe = await createTribe(t, node1)
  t.truthy(tribe, 'tribe should have been created by node1')

  //NODE2 JOINS TRIBE CREATED BY NODE1
  if (node1.routeHint) tribe.owner_route_hint = node1.routeHint
  let join = await joinTribe(t, node2, tribe)
  t.true(join, 'node2 should join tribe')

  //NODE1 SENDS A TEXT MESSAGE IN TRIBE
  const text = randomText()
  let tribeMessage = await sendTribeMessageAndCheckDecryption(
    t,
    node1,
    node2,
    text,
    tribe
  )
  t.true(!!tribeMessage, 'node1 should send message to tribe')

  //NODE2 SENDS A TEXT MESSAGE IN TRIBE
  const text2 = randomText()
  let tribeMessage2 = await sendTribeMessageAndCheckDecryption(
    t,
    node2,
    node1,
    text2,
    tribe
  )
  t.true(!!tribeMessage2, 'node1 should send message to tribe')

  //NODE2 LEAVES THE TRIBE
  let left = await leaveTribe(t, node2, tribe)
  t.true(left, 'node2 should leave tribe')

  //NODE2 LEAVES THE TRIBE
  let delTribe = await deleteTribe(t, node1, tribe)
  t.true(delTribe, 'node1 should delete tribe')
}

test.serial('Tribe test for seeing that if 2 nodes have the same alias, the sender alias is changed',async (t: ExecutionContext<Context>) => {
  t.true(Array.isArray(nodes))
  await iterate(nodes, async (node1, node2) => {
    await tribeUniqueAliasTest(t,node1,node2)
  })
})

// Tests that if 2 nodes with the same alias join a tribe, their alias assigned in the tribes is different
async function tribeUniqueAliasTest(
    t: ExecutionContext<Context>,
    node1: NodeConfig,
    node2: NodeConfig
) {
  //NODE1 creates a tribe
  let tribe = await createTribe(t, node1);
  t.truthy(tribe, 'tribe should have been created by node1')

  //Set the alias of NODE2 to be the same as NODE1
  node2.alias = node1.alias;
  //Check that both nodes have the same alias
  t.true(node1.alias === node2.alias)
  console.log(node1.alias,node2.alias)

  //NODE2 JOINS TRIBE CREATED BY NODE1
  if (node1.routeHint) tribe.owner_route_hint = node1.routeHint
  let join = await joinTribe(t, node2, tribe)
  t.true(join, 'node2 should join tribe')
  const url = mqttURL(tribe.host);
  const messages: any[] = [];
  const pwd = await genSignedTimestamp(node2.pubkey)
  /*
  Not sure if this is the correct way or not
   */
  const cl = mqtt.connect(
      url, {
        username: node2.pubkey,
        password: pwd,
        reconnectPeriod:0
  })
  cl.on('message', function (topic,message) {
    const temp = (JSON.parse(message.toString()))
    messages.push(temp);
  })


  let text = randomText()
  let tribeMessage = await sendTribeMessageAndCheckDecryption(
      t,
      node1,
      node2,
      text,
      tribe
  )
  t.true(!!tribeMessage, 'node1 should send message to tribe')
  t.true(messages[0].sender_alias!==messages[0].recipient_alias,'The recipient alias should be different from the sender alias')
  //Check that our logic for assigning an alternate alias is working
  t.true(messages[0].sender_alias === `${node1.alias}_2`)

  //NODE2 LEAVES THE TRIBE
  let left = await leaveTribe(t, node2, tribe)
  t.true(left, 'node2 should leave tribe')

  //NODE1 LEAVES THE TRIBE
  let delTribe = await deleteTribe(t, node1, tribe)
  t.true(delTribe, 'node1 should delete tribe')

}

function mqttURL(h: string) {
  //Not sure what the configs should be since I don't have the env files
  let host = config.mqtt_host || h
  let protocol = 'tls'
  if (config.tribes_insecure) {
    protocol = 'tcp'
  }
  let port = 8883
  if (config.tribes_mqtt_port) {
    port = config.tribes_mqtt_port
  }
  if (host.includes(':')) {
    const arr = host.split(':')
    host = arr[0]
  }
  return `${protocol}://${host}:${port}`
}
