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

void setup_wifi();
void callback(char* topic, byte* payload, unsigned int length);
float readWeight();
void performTare();
void sendWeightData();
void reconnect();

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
    Serial.print("Attempting MQTT connection.. ");
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
      delay(5000);
    }
  }
}