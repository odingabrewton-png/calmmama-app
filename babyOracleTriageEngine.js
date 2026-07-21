/** 2 AM Baby Oracle — late-night symptom triage guides */

export const ORACLE_TRIAGE_TOPICS = [
  {
    id: 'sleep',
    label: 'Sleeplessness',
    emoji: '🌙',
    title: 'Late-night sleeplessness',
    opener:
      'Before we troubleshoot, take one slow breath. Overtired babies often fight sleep hardest — we will walk through calm resets in order.',
    steps: [
      'Check the basics: dry diaper, comfortable temperature, and no hair wrapped around a finger or toe.',
      'Dim all screens and overhead lights — use a soft amber night-light only if needed.',
      'Try skin-to-skin contact with slow shushing at the rhythm of your heartbeat for 3–5 minutes.',
      'Offer a feed if it has been 2+ hours; burp gently and hold upright before laying back down.',
      'If baby is overtired, shorten the next wake window tomorrow by 10–15 minutes.',
    ],
    escalate:
      'Call your pediatrician if baby will not settle for 2+ hours, refuses multiple feeds, or seems unusually floppy or stiff.',
  },
  {
    id: 'congestion',
    label: 'Congestion',
    emoji: '💨',
    title: 'Stuffy nose & congestion',
    opener:
      'Congestion at 2 AM is frightening and common. Let us clear the airway gently before assuming the worst.',
    steps: [
      'Sit upright with baby on your chest — gravity helps drain secretions better than flat sleeping.',
      'Run a cool-mist humidifier or sit in a steamy bathroom for 10 minutes (never hot steam near skin).',
      'Saline drops in each nostril, wait 30 seconds, then use a bulb syringe or NoseFrida gently.',
      'Offer smaller, more frequent feeds — stuffy babies tire while eating.',
      'Elevate the head of the sleep space slightly only if safe per your pediatrician’s guidance.',
    ],
    escalate:
      'Seek urgent care if you see blue lips, nostrils flaring with every breath, ribs pulling in sharply, or fewer than 6 wet diapers in 24 hours.',
  },
  {
    id: 'fever',
    label: 'Minor fever',
    emoji: '🌡️',
    title: 'Low-grade fever check-in',
    opener:
      'A warm forehead at midnight can spike panic. Let us measure calmly and know exactly what warrants a call.',
    steps: [
      'Take a rectal or temporal temperature — rectal is most accurate under 3 months.',
      'Under 3 months: any fever of 100.4°F (38°C) or higher needs a same-night pediatric call.',
      '3+ months: note behavior — is baby drinking, making eye contact, and having wet diapers?',
      'Dress in one light layer; avoid cold baths or alcohol rubs.',
      'Offer breast or bottle on demand; hydration matters more than forcing food.',
    ],
    escalate:
      'Go to emergency care for fever with a stiff neck, a non-blanching rash, trouble breathing, or if baby is hard to wake.',
  },
  {
    id: 'fussy',
    label: 'Fussiness',
    emoji: '🍼',
    title: 'Unexplained fussiness',
    opener:
      'Sometimes babies cry without a clear label. We will rule out the usual midnight culprits one by one.',
    steps: [
      'Check diaper, clothing tags, and hair tourniquet on fingers or toes.',
      'Bicycle legs and gentle tummy massage in a clockwise circle for gas relief.',
      'Offer a pacifier or clean finger to suck; non-nutritive sucking calms the nervous system.',
      'Try a change of scenery — dim walk, white noise, or slow rocking for 5 minutes.',
      'Tag your partner for a 15-minute handoff so you can reset your own nervous system.',
    ],
    escalate:
      'Call your pediatrician if crying is high-pitched and continuous for 3+ hours, or if baby has a bulging soft spot or vomiting forcefully.',
  },
];

export function getOracleTopic(concernId) {
  return ORACLE_TRIAGE_TOPICS.find((t) => t.id === concernId) ?? null;
}
