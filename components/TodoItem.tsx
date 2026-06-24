import { Todo } from "@/app/todos";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

export default function TodoItem({ item }: { item: Todo }) {
  return (
    <View style={styles.item}>
      <Text style={styles.todoTitle}>{item.title}</Text>
      <Text style={styles.status}>
        Status: {item.completed ? "Selesai" : "Belum Selesai"}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 20,
    paddingHorizontal: 20,
    gap: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
  },
  item: {
    padding: 16,
    backgroundColor: "#dedede",
    marginBottom: 10,
    borderRadius: 8,
    flexDirection: "column",
  },
  todoTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  status: {
    color: "#666",
  },
});
