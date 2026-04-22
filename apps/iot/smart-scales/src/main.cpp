#include <Arduino.h>
#include <WiFi.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>

String topicCmd;
String topicData;

const int PIN_SENSOR = 34; 
const int PIN_LED = 2;     

float calibrationFactor = 0.024; 
float tareOffset = 0.0;          

WiFiClient espClient;
PubSubClient client(espClient);

// Fallback broker list (disabled for now; single-broker mode enabled)
// const char* MQTT_BROKERS[] = {
//   MQTT_SERVER,
//   "broker.hivemq.com",
//   "broker.emqx.io"
// };
// const size_t MQTT_BROKER_COUNT = sizeof(MQTT_BROKERS) / sizeof(MQTT_BROKERS[0]);
// size_t currentBrokerIndex = 0;
// int failedConnectAttemptsOnBroker = 0;
// const int MAX_FAILED_ATTEMPTS_PER_BROKER = 3;

void setup_wifi();
void callback(char* topic, byte* payload, unsigned int length);
float readWeight();
void performTare();
void sendWeightData();
void reconnect();
void printDnsDiagnostics(const char* brokerHost);
void switchToNextBroker();

void setup() {
  Serial.begin(115200);
  pinMode(PIN_SENSOR, INPUT);
  pinMode(PIN_LED, OUTPUT);

  topicCmd = String("nutri-sense/devices/") + DEVICE_SERIAL + "/cmd";
  topicData = String("nutri-sense/devices/") + DEVICE_SERIAL + "/data";

  Serial.println("\n--------------------------------");
  Serial.print("Device Serial: "); Serial.println(DEVICE_SERIAL);
  Serial.print("Listening on:  "); Serial.println(topicCmd);
  Serial.print("Publishing to: "); Serial.println(topicData);
  Serial.println("--------------------------------");

  setup_wifi();
  // Single-broker mode
  client.setServer(MQTT_SERVER, MQTT_PORT);
  client.setCallback(callback); 
}

void loop() {
  if (!client.connected()) {
    reconnect();
  }
  client.loop();
  delay(100); 
}

void setup_wifi() {
  delay(10);
  Serial.println();
  Serial.print("Connecting to WiFi");
  WiFi.begin(SSID_NAME, SSID_PASS);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println(" Connected!");
}

void callback(char* topic, byte* payload, unsigned int length) {
  String message;
  for (unsigned int i = 0; i < length; i++) {
    message += (char)payload[i];
  }
  
  Serial.print("\nMessage arrived [");
  Serial.print(topic);
  Serial.print("]: ");
  Serial.println(message);

  if (message == "GET_WEIGHT") {
    sendWeightData();
  } else if (message == "TARE") {
    performTare();
  }
}

float readWeight() {
  int rawValue = analogRead(PIN_SENSOR);
  float weight = (rawValue * calibrationFactor * 100) - tareOffset;
  if (weight < 0) weight = 0.0;
  return weight;
}

void performTare() {
  int rawValue = analogRead(PIN_SENSOR);
  tareOffset = rawValue * calibrationFactor * 100;
  Serial.println("\nScale Tared (Zeroed)!");
}

void sendWeightData() {
  float weight = readWeight();
  
  StaticJsonDocument<200> doc;
  doc["device_id"] = DEVICE_SERIAL;
  doc["weight"] = weight; 
  doc["unit"] = "g";
  doc["status"] = "ok";

  char buffer[256];
  serializeJson(doc, buffer);

  client.publish(topicData.c_str(), buffer);
  Serial.print("\nSent data to ");
  Serial.print(topicData);
  Serial.print(": ");
  Serial.println(buffer);
}

void reconnect() {
  while (!client.connected()) {
    const char* currentBroker = MQTT_SERVER;
    printDnsDiagnostics(currentBroker);

    Serial.print("Attempting MQTT connection.. ");
    Serial.print("(broker=");
    Serial.print(currentBroker);
    Serial.print(") ");
    String clientId = "ESP32-" + String(DEVICE_SERIAL) + "-" + String(random(0xffff), HEX);
    
    if (client.connect(clientId.c_str())) {
      Serial.println("connected");
      client.subscribe(topicCmd.c_str());
      Serial.print("\nSubscribed to: ");
      Serial.println(topicCmd);
    } else {
      Serial.print("failed, rc=");
      Serial.print(client.state());
      Serial.println(" try again in 5 seconds");
      // rc=-2 means TCP connect failed; usually DNS/network/broker reachability.
      if (client.state() == -2) {
        printDnsDiagnostics(currentBroker);
      }
      // Fallback broker switching is intentionally disabled (single-broker mode).
      // if (failedConnectAttemptsOnBroker >= MAX_FAILED_ATTEMPTS_PER_BROKER) {
      //   switchToNextBroker();
      // }

      delay(5000);
    }
  }
}

void printDnsDiagnostics(const char* brokerHost) {
  Serial.println("\n[MQTT DIAGNOSTICS]");
  Serial.print("WiFi status: ");
  Serial.println(WiFi.status() == WL_CONNECTED ? "CONNECTED" : "DISCONNECTED");
  if (WiFi.status() == WL_CONNECTED) {
    Serial.print("Local IP: ");
    Serial.println(WiFi.localIP());
    Serial.print("RSSI: ");
    Serial.print(WiFi.RSSI());
    Serial.println(" dBm");
  }
  Serial.print("Broker host: ");
  Serial.println(brokerHost);

  IPAddress resolvedIp;
  if (WiFi.hostByName(brokerHost, resolvedIp)) {
    Serial.print("DNS resolved: ");
    Serial.println(resolvedIp);
  } else {
    Serial.println("DNS resolved: FAILED");
  }
  Serial.println("[/MQTT DIAGNOSTICS]");
}

void switchToNextBroker() {
  // Disabled: keep function for quick re-enable later.
  // size_t previous = currentBrokerIndex;
  // currentBrokerIndex = (currentBrokerIndex + 1) % MQTT_BROKER_COUNT;
  // failedConnectAttemptsOnBroker = 0;
  //
  // client.setServer(MQTT_BROKERS[currentBrokerIndex], MQTT_PORT);
  // Serial.print("\nSwitching MQTT broker: ");
  // Serial.print(MQTT_BROKERS[previous]);
  // Serial.print(" -> ");
  // Serial.println(MQTT_BROKERS[currentBrokerIndex]);
}