# Music Theory Path

Native Android-first Expo app for a complete, age-accessible Grade 1–5 music-theory pathway from beginner to intermediate.

## Product boundary

- Theory and notation only; a parent or teacher handles practical instrumental work.
- Independent Grade 1–5 curriculum using original teaching text and generated exercises.
- Rhythm receives an expanded parallel pathway: pulse, note/rest duration, subdivision, metre, beaming and grouping.
- The learner advances by individual skill mastery, not by a single overall percentage.

## Current functional build

- 12 pre-Grade-1 lessons from beat and duration through treble/bass foundations.
- 11 complete Grade 1 lesson areas covering rhythm, notation, keys, intervals, tonic triads and musical language.
- Rule-generated practice across 25 independently tracked skills.
- Scalable native notation for core note values, rests, subdivisions and stave questions.
- Four-beat audible and visual pulse for rhythm reasoning.
- Adaptive selection of the least-secure skill that is due for review.
- Different mastery gains for first-attempt and supported answers.
- Spaced review intervals that expand as mastery increases.
- Durable local progress through AsyncStorage.
- Parent view based on real attempts, sessions, accuracy and per-skill mastery.
- Grade 2–5 dependency and coverage map in the curriculum model, without empty selectable screens.
- Native Android UI with no web view and no online service dependency.

## Required before release

1. Test the native build on the target Android phone, especially audio volume, small-screen notation and restart persistence.
2. Review each lesson with the learner and parent before expanding the content bank.
3. Complete Grade 2 only after Grade 1 behaviour and progression are proven.
4. Produce an APK/AAB through EAS after device testing.

## Run

```bash
npm start
```

## Android builds

- Installable test APK: `eas build --platform android --profile preview`
- Google Play AAB: `eas build --platform android --profile production`

The preview profile is internal distribution only. It does not publish the app.
