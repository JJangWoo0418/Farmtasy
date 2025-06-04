import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f8fb',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  image: {
    width: 180,
    height: 180,
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    fontSize: 18,
    color: '#555',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 28,
  },
  button: {
    backgroundColor: '#19c37d',
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 32,
    marginBottom: 32,
    alignSelf: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  botBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#e6f7ef',
    borderRadius: 16,
    padding: 14,
    marginVertical: 6,
    marginLeft: 8,
    marginRight: 60,
    maxWidth: '80%',
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#19c37d',
    borderRadius: 16,
    padding: 14,
    marginVertical: 6,
    marginRight: 8,
    marginLeft: 60,
    maxWidth: '80%',
  },
  botText: {
    color: '#222',
    fontSize: 17,
    lineHeight: 24,
  },
  userText: {
    color: '#fff',
    fontSize: 17,
    lineHeight: 24,
  },
});

export default styles;
