import React from 'react';
import { View, StyleSheet } from 'react-native';

export default function TabIcon({ name, active }) {
  const color = active ? '#0F172A' : '#94A3B8';

  switch (name) {
    case 'tasks':
    case 'pipeline':
      return (
        <View style={styles.iconContainer}>
          <View style={[styles.line, { backgroundColor: color, width: 16 }]} />
          <View style={[styles.line, { backgroundColor: color, width: 16 }]} />
          <View style={[styles.line, { backgroundColor: color, width: 10, alignSelf: 'flex-start', marginLeft: 2 }]} />
        </View>
      );

    case 'ideas':
      return (
        <View style={styles.iconContainer}>
          <View
            style={[
              styles.ideaBulb,
              { borderColor: color, backgroundColor: active ? '#F1F5F9' : 'transparent' },
            ]}
          />
          <View style={[styles.ideaBase, { backgroundColor: color }]} />
        </View>
      );

    case 'audit':
    case 'legal':
      return (
        <View style={styles.iconContainer}>
          <View style={[styles.auditCircle, { borderColor: color }]}>
            <View
              style={[
                styles.auditInner,
                { backgroundColor: active ? color : 'transparent' },
              ]}
            />
          </View>
        </View>
      );

    case 'profile':
    default:
      return (
        <View style={styles.iconContainer}>
          <View style={[styles.avatarHead, { borderColor: color }]} />
          <View style={[styles.avatarBody, { borderColor: color }]} />
        </View>
      );
  }
}

const styles = StyleSheet.create({
  iconContainer: {
    width: 24,
    height: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 3,
  },
  line: {
    height: 2,
    borderRadius: 1,
    marginBottom: 2.5,
  },
  ideaBulb: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 1.8,
  },
  ideaBase: {
    width: 5,
    height: 2.5,
    borderRadius: 1,
    marginTop: 1.5,
  },
  auditCircle: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1.8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  auditInner: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  avatarHead: {
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 1.8,
    marginBottom: 1,
  },
  avatarBody: {
    width: 14,
    height: 6,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
    borderWidth: 1.8,
    borderBottomWidth: 0,
  },
});
