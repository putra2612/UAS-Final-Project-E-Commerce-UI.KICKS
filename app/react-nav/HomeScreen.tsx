import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function HomeScreen({ navigation }: any) {
  return (
    <View
      style={{
        flex: 1,
        paddingVertical: 20,
        paddingHorizontal: 20,
        gap: 20,
      }}
    >
      <Text style={styles.title}>Home Screen</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("profile")} // Nama harus sesuai dengan key di RootStack
      >
        <Text style={styles.text}>Pergi ke Profile</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
  },
  button: {
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 10,
  },
  text: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
});
