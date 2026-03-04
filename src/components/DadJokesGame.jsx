import { useState, useEffect, useRef } from "react";

const JOKES = [{"q":"Why don't Pirates ever go to jail?","a":"They always get off the hook"},{"q":"What do you call a female friend who's into men and women but only on Fridays?","a":"Bye Felicia"},{"q":"What would be a good City to film a new Star Wars movie?","a":"Mustafar"},{"q":"What rapper disagrees with everything?","a":"Mims (No)"},{"q":"What piece of audio equipment recently became a stripper?","a":"Magic Mike"},{"q":"Why didn't the blind man put his money in the bank?","a":"Because he didn't feel safe"},{"q":"What sound does a snake make when he's frying chicken?","a":"Sssssssss"},{"q":"Did you know among insects ladybugs have the highest rated STDs?","a":"They explain the spots"},{"q":"Why didn't the thief Rob the furniture store?","a":"The tables was turned"},{"q":"Two giraffes were racing. Who won?","a":"They were neck and neck"},{"q":"I moved my dragon tree from one side of the house to the other. Now it's...?","a":"A transplant"},{"q":"What did the DJ who wrote the Cha Cha Slide say to his friends?","a":"Take it back now y'all"},{"q":"What band was known for stealing all the time?","a":"The Jackson Five"},{"q":"What do you get when you mix a boxer and a volleyball player?","a":"A Spike punch"},{"q":"What did one sidewalk say to the next sidewalk?","a":"I'll meet you at the corner"},{"q":"What do you call a man with a rubber toe?","a":"Roberto"},{"q":"What NBA team gives the best haircuts?","a":"L.A. Clippers"},{"q":"What team did KD not want to get traded to?","a":"The Clippers"},{"q":"If Michael Jackson was still alive, how would he move on stage?","a":"With the moon walker"},{"q":"Why can't you use coupons at the strip club?","a":"They already got half off"},{"q":"What do you call a mermaid with an STD?","a":"A filet of fish"},{"q":"What did the cloud wear to the baby shower?","a":"A rainbow"},{"q":"What has no eyes but it's always looking?","a":"The stairs"},{"q":"What kind of animal does taxes?","a":"A beaver/accountant cow"},{"q":"Why is it so important to Will Smith for people to attend school?","a":"Because on a playground is where he spent most of his days"},{"q":"Did you hear about Fetty Wap's banquet?","a":"The word on the street is 1738"},{"q":"What do you call your significant other after a sweet workout?","a":"Sorbet"},{"q":"I got a fish that could break dance for 20 seconds. He can only do it once. Why?","a":"Because you cooked them"},{"q":"Why did Rihanna get pregnant?","a":"She wanted a baby ASAP"},{"q":"Why didn't the girl keyboard get along with the boy keyboard?","a":"He's not her type"},{"q":"Why didn't Rihanna's backup dancer show up at the Super Bowl?","a":"She couldn't take off work"},{"q":"Have you heard of the hotel that let chefs stay for free?","a":"The Four Seasons"},{"q":"Have you heard about the new genre of music coming straight out of the fields in Iowa?","a":"It's called popcorn"},{"q":"Did you hear about the cow that went to space?","a":"They went through the Moon"},{"q":"Why did the captain love his new boat?","a":"He got it for sale"},{"q":"Why did the hip-hop head jump out of the airplane in the 90s?","a":"So he could do some sky wrapping"},{"q":"When does a joke become a dad joke?","a":"When it's a parent"},{"q":"How do you turn a zero to an eight?","a":"A waist trainer"},{"q":"What do you call a woman that looks like her father?","a":"Back in the morning"},{"q":"What do you call a woman who brings an overnight bag to a one-night stand?","a":"Comfortable and Uber"},{"q":"If two people having sex is a twosome and three is a threesome...?","a":"Believe me when I tell you I'm handsome"},{"q":"What type of password do gang members have?","a":"Encrypted"},{"q":"You don't need a parachute to go skydiving. You need one to go skydiving...?","a":"Twice"},{"q":"They called it a party full of Asians, blacks, and Mexicans...?","a":"A Minority Report"},{"q":"Why could the man find the money in his three-piece suit?","a":"It was invested"},{"q":"A student was fined for not standing up for the anthem. Guess how much?","a":"A copper nickel (Kaepernick)"},{"q":"What did the pig say when he was locked in the sauna?","a":"I'm baking"},{"q":"How do you make coffee exercise?","a":"Grinding beans/Make it do Pilates"},{"q":"What slay from the south to the north?","a":"A free throw"},{"q":"Which one of the Jacksons were kicked out of the group for cursing?","a":"Samuel L Jackson"},{"q":"I was reading a great article about glue. Why couldn't I put it down?","a":"Because I was too stuck"},{"q":"I had beef with my art teacher. I told her...?","a":"This is where I draw the line"},{"q":"Why was Brittany Griner nervous in the locker room when she heard a sound?","a":"She thought somebody was Putin"},{"q":"What does a text message need to get in the club?","a":"A W-I-D (what I'd)"},{"q":"What tattoo did I get drunk?","a":"Henna (Hennessy + henna)"},{"q":"What is it called when you've seen the exact same black magic twice?","a":"Black to back / Deja Vu"},{"q":"Where do you learn to make a banana split?","a":"Sunday School"},{"q":"Which is faster, hot or cold?","a":"Cold because you can catch a cold"},{"q":"What Mexican food is best cold?","a":"Chipotle (Burr-ito)"},{"q":"What kind of store will Russell Westbrook open?","a":"Brick and mortar"},{"q":"What do you call a poor Santa Claus?","a":"A poet (poor Sam Claus)"},{"q":"What do you call wind while it's dancing?","a":"Flow chart"},{"q":"What NFL team brags the most?","a":"The Baltimore Ravens (they rave)"},{"q":"What do you call a female cigar?","a":"Philly blunt"},{"q":"What do you call it when you miss a haircut?","a":"Dodging the fade"},{"q":"What do you call a big girl walking up the stairs?","a":"A stairwell (whale)"},{"q":"I went out with a girl with a horrible hairstyle. I made the reservation for...?","a":"Erica Bad Hair Do"},{"q":"What does a vagina and a sponge have in common?","a":"They both need to be wet to work"},{"q":"What is Bruce Lee's favorite beverage at a restaurant?","a":"Water"},{"q":"What did the universe say in his diss track?","a":"All you is my sons"},{"q":"Why did the maggot get kicked out of the fashion show?","a":"He wasn't fly enough"},{"q":"Why did the girls get in the trunk?","a":"To get away from the boys in the hood"},{"q":"What did Beyonce do at the front desk?","a":"Get information"},{"q":"Why is 50 Cent sad?","a":"Because many men, many many many"},{"q":"Did you hear about Shakespeare's new streaming service?","a":"To be or not to be"},{"q":"Are they remaking Interview with the Vampire?","a":"Good because it'll suck"},{"q":"The chicken got a technical called on him during a basketball game. It was a...?","a":"Foul play"},{"q":"Who's R Kelly's favorite NBA player?","a":"The Pistons"},{"q":"Why did R Kelly go plant-based vegan?","a":"Because he found out about pea protein"},{"q":"Did you know Arnold Schwarzenegger is starring in an action movie about Vine?","a":"I'll be batch"},{"q":"My short uncle just got out of prison. I see him mean mugging. I thought...?","a":"Isn't that a little condescending"},{"q":"What did the coffee tell the police?","a":"The mugged me"},{"q":"How does Patrick Cloud keep his bicycle safe?","a":"He used a bike dreadlock"},{"q":"How do you know if the egg is laughing?","a":"It'd be cracking up"},{"q":"A telepathic gnome just robbed the bank...?","a":"A small medium and large"},{"q":"What did Liam Neeson say to the calendar?","a":"Your days are numbered"},{"q":"What was Kobe Bryant's first words as a baby?","a":"Mamba mamba"},{"q":"How do animals find out who their parents are?","a":"They go on the furry Povich Show"},{"q":"How can you tell if a cow is sad?","a":"He's Moody"},{"q":"Why was the orphan always late to school?","a":"She didn't have homeroom"},{"q":"Why do we call almond milk milk?","a":"Because no one would drink it if we called it nut juice"},{"q":"When will Young Thug get out of jail?","a":"When he's old Thug"},{"q":"I read an article titled 'a hundred things to do before you die'. Would you believe...?","a":"Call 9-1-1"},{"q":"What did the cat say to his cat homie?","a":"Hey yo pause pause"},{"q":"What do DJ Khaled's kids say when he doesn't have time for them?","a":"We depressed"},{"q":"Why did the gorillas make the chimps pay them in fruit?","a":"It wasn't personal, just Monkey Business"},{"q":"What do you call a transgender psychic?","a":"A small wonder"},{"q":"My former girlfriend opened up a sunglasses store. It's called...?","a":"Black X lens"},{"q":"How did you know Auto-Tune was hurting?","a":"It was in T-Pain"},{"q":"What type of dinner runs straight through you?","a":"Fast food"},{"q":"What country's capital is growing the fastest in the world?","a":"Ireland. It's Dublin"},{"q":"What kind of couch does it like to commit?","a":"A pull out couch"},{"q":"What's the difference between the bird flu and the swine flu?","a":"One requires treatment and the other requires oink"},{"q":"Did you know Shaft's great great grandfather was a pirate?","a":"It was his duty to find that booty"},{"q":"What do mermaids wash their fins with?","a":"Tide"},{"q":"Did you know in King Arthur's time, one of the knights of the round table collected taxes?","a":"His name was Sir Charge"},{"q":"What did the fried rice say to the shrimp?","a":"Fry your rice"},{"q":"Did you hear Steve Harvey and his wife got into a fight?","a":"It was a family feud"},{"q":"Did you hear about the superhero with a lisp that always worked out?","a":"He's Thor"},{"q":"What kind of car does an egg drive?","a":"A yvagan (Egg-van)"},{"q":"Did you hear about Mr. Cup? His wife left him...?","a":"Now he's a solo cop"},{"q":"The weekdays Thursday and Friday were hanging out. They heard crying. It was...?","a":"Saturday morning"},{"q":"What NFL team would make a great moving company?","a":"The Green Bay Packers"},{"q":"What does AC do with all of his leftovers?","a":"He saves it for Slater"},{"q":"What did they call it when the wine economy had its worst recession?","a":"The Great Depression"},{"q":"I heard T-Mobile can rap, but he got showed up when Samsung...?","a":"It was the sound"},{"q":"Why couldn't the typewriter have fun?","a":"Because he was so keyboard"},{"q":"What did Elsa have for his birthday?","a":"A crab cake"},{"q":"Why are donuts God's favorite food?","a":"Because they're holy (they have a hole in them)"},{"q":"What do you call a celebrity boat?","a":"Tom Cruise ship"},{"q":"What do you call a moose with no name?","a":"A nana moose (Anonymous)"},{"q":"What do you call beef propped against a wall?","a":"Lean meat"},{"q":"What kind of bee makes milk?","a":"Boobies"},{"q":"What did Conor McGregor say after Mayweather beat him?","a":"I got a black eye from a black eye"},{"q":"How did the whale defend itself?","a":"With a swordfish"},{"q":"Knock knock. Who's there? Interrupting mystical...?","a":"Inter"},{"q":"Who was the Bee's favorite NFL quarterback?","a":"Drew Brees"},{"q":"What do you call a bee with a low buzz?","a":"A mumble bee"},{"q":"What does the bee say to his wife when he leaves for work?","a":"Bye, honey"},{"q":"What's a fish's favorite mafia movie?","a":"The Codfather"},{"q":"What's the one injury that can stop a Bronco?","a":"Charlie horse"},{"q":"Where did broke rappers shop?","a":"Rick Ross"},{"q":"How did the farmer fix the hole in his pants?","a":"With a cabbage patch"},{"q":"How did the Japanese guy get into his house?","a":"With a teriyaki"},{"q":"What do you call an overprotective father trying to stop his kid from having sex?","a":"A pop blocker"},{"q":"What would King Arthur call his crazy parties?","a":"All nighters"},{"q":"Why are women in such great shape?","a":"Because they run the world"},{"q":"What does Sylvester Stallone and Lil Kev's upbringing both have in common?","a":"They both were a little rocky"},{"q":"Why did the patient refuse to pay the proctologist for her butt lift?","a":"She said it still had a little crack in it"},{"q":"Do you know Fred Flintstone's daughter had a baby with a black dude?","a":"Baby's name's Cocoa Pebbles"},{"q":"What do cereal boxes love to do at a slumber party?","a":"Pantry raids"},{"q":"I just went to the doctor. I'm so mad. He told me I had high blood pressure. I'm...?","a":"So salty"},{"q":"And Cardi B is attractive, but her cousin Cardio...?","a":"Leaves me breathless"},{"q":"What's a baker's favorite hairstyle?","a":"Breadlocks"},{"q":"What did the full glass say to the half empty glass?","a":"You look drunk"},{"q":"What do you call three rapping longlegg birds?","a":"Flamigos"},{"q":"What do you call someone who gets mad when they don't have any bread?","a":"Lactose intolerant"},{"q":"What do you call the syrup with a speech impediment?","a":"Scissorp / Mrs. Stuttersworth"},{"q":"What airlines did Jesus and Mary take?","a":"Virgin"},{"q":"What's the most crunk place to go to the bathroom?","a":"The Little John"},{"q":"What was the foot's favorite type of chips?","a":"Doritos"},{"q":"What do you call Lil Cav with glasses?","a":"Shortsighted"},{"q":"I tried to start a conversation with an elevator, but it...?","a":"Just let me down"},{"q":"There's a witch that was casting spells at the mall. Now...?","a":"I'm forever 21"},{"q":"What football player has the perfect name to sell real estate?","a":"Patrick Mahomes"},{"q":"I was addicted to the hokeypokey. But luckily...?","a":"I turned myself around"},{"q":"What advice did Biggie Smalls give to the cow?","a":"Moo money, moo problems"},{"q":"What did Charlotte Web say to her husband when she got caught cheating?","a":"It was just an entanglement"},{"q":"How does a teddy bear decline a meal?","a":"I'm okay, I'm stuffed"},{"q":"What kind of cars does a ghost drive?","a":"A Buick"},{"q":"When is the clock most violent?","a":"When it strikes"},{"q":"What are the best shades to wear in New York?","a":"Sunglasses"},{"q":"What do doctors call a tiny heart?","a":"Kevin Hart"},{"q":"What's the best social media snack?","a":"Instagram crackers"},{"q":"What does the car say to the banana?","a":"Peel out"},{"q":"What is a blocker's favorite candy?","a":"Charleston Chew"},{"q":"What's one thing an orphan can't take?","a":"A family photo"},{"q":"Did you know the Dodgers signed the Kool-Aid Man?","a":"He's a pitcher"},{"q":"Why didn't the alligator go out to party after work?","a":"Because he was swamped"},{"q":"What do rappers have on their teeth?","a":"Gold plaque"},{"q":"What do you call a hippiey's wife?","a":"Mississippi"},{"q":"What is the fastest liquid on Earth?","a":"Milk (it's pasteurized before you know it)"},{"q":"What type of music are pimples scared of?","a":"Pop music"},{"q":"My wife asks if I knew how much binoculars cost. I said...?","a":"I'll look into it"},{"q":"I saw a baker break up with his girlfriend. He said...?","a":"He needed space"},{"q":"Why didn't the bicycle go to the club?","a":"Because it was too tired"},{"q":"I saw my bodybuilder friend trying different sauces. Those were...?","a":"Weighted dips"},{"q":"What do you call a musician who's bad with money?","a":"Broke-y Robinson"},{"q":"Did you know it's illegal to laugh loudly in Hawaii?","a":"You gotta keep it aloha"},{"q":"Did you hear about what happened to the vampires in Philly?","a":"Got killed with the cheese steak"},{"q":"Did you hear about the fat pizza man stuck in the fridge?","a":"There wasn't mushroom"},{"q":"What is an oyster's favorite candy?","a":"Shelly beans"},{"q":"A friend got offered a job as an undertaker but he turned it down...?","a":"He couldn't dig it"},{"q":"What kind of shoes do gophers wear?","a":"Gophers (go-phers)"},{"q":"What do you call a lazy doctor?","a":"Dr. Doolittle"},{"q":"Did you know on average people want three covers on their beds at all times?","a":"That's just a blanket statement"},{"q":"What did the pot eat on its birthday?","a":"Brownies"},{"q":"Where would you grow a chef?","a":"Bakersfield"},{"q":"What do you call a camel in a drought?","a":"Camel toe"},{"q":"What was the fat kid's favorite movie?","a":"New Snack City"},{"q":"What soda do blind people hate?","a":"Pepsi"},{"q":"Why didn't the Eagle study for its test?","a":"He just figured he could wing it"},{"q":"What does a cop car sound like that belongs to the Bloods?","a":"Whoop"},{"q":"What do you call it when Blake Griffin picks his nose?","a":"A pick and roll"},{"q":"Why did Blake Griffin bring oxygen as his date to the big ball?","a":"Because it was an airball"},{"q":"I told my wife she needs to start embracing her mistakes. So...?","a":"She gave me a hug"},{"q":"Five-fourths of people admit that they're bad at fractions...?","a":"That's what the statistic says"},{"q":"Who is Door Dash's main competition when it comes to deliveries?","a":"Nick Cannon (he makes babies)"},{"q":"What do you call a person who doesn't believe in Santa Claus?","a":"Eggnog stick"},{"q":"What is Starbucks favorite city?","a":"Fort Latteale"},{"q":"Why did the salad go to the studio?","a":"To get some beats"},{"q":"How do you get a squirrel down from the tree?","a":"Pull down your pants and show them your nuts"},{"q":"I used to hate facial hair, but then...?","a":"It grew on me"},{"q":"What was the robot's favorite movie?","a":"Grease"},{"q":"What did the pastry tell a barber?","a":"Give me a biscuit"},{"q":"Why is Stevie Wonder's calendar like meeting people on Tinder?","a":"It's all blind dates"},{"q":"What kind of sneakers do chickens wear?","a":"Rebox"},{"q":"Why do trees make terrible fathers?","a":"All they do is leave"},{"q":"What do you call a troublestarting alligator?","a":"An instigator"},{"q":"Why does Shaft work 24/7?","a":"Because he's woke"},{"q":"What's the difference between a poorly dressed man on a tricycle and a well-dressed man on a bicycle?","a":"Attire"},{"q":"What is the best tool to make a car move?","a":"A screwdriver"},{"q":"What did Aunt Jamima say when she ran out of pancakes?","a":"How waffle?"},{"q":"What did DJ allergies say to the nose?","a":"Why don't you drop it like it's snot?"},{"q":"Why is a pig's tail like waking up at 4:00 a.m.?","a":"It's twirly"},{"q":"What did the jam say to Beyonce?","a":"I don't think you're ready for this jelly"},{"q":"What do you call it when Erica Badu falls down a flight of stairs?","a":"Erica Badu (she fell)"},{"q":"What do you call a mom that's not good at driving?","a":"One bad mother trucker"},{"q":"Why did the power line not go to prom?","a":"She was grounded"},{"q":"What did the quarterback tell his high school counselor after he threatened to fail him?","a":"Don't worry, I'll pass"},{"q":"Why did the German chef lose in a sausage cooking contest?","a":"Because he was the worst"},{"q":"I recently went vacuum shopping, but I left...?","a":"Disappointed. The selection sucked"},{"q":"What do you get when a lawyer and a box have a baby?","a":"A basket case"},{"q":"What do you call the questions of midgets?","a":"Small wonders"},{"q":"What did the tree say to the bark when it wanted to quit?","a":"Stick with it"},{"q":"What do you call a monk that sells potato chips?","a":"Chipmunk"},{"q":"What do you call sex on a camping trip?","a":"Intense"},{"q":"What do you call a droid that takes the long way?","a":"R2 Detour"},{"q":"I used to date this dominatrix. She wanted to be exclusive and I said...?","a":"My hands are tied"},{"q":"Where do snacks stand trial?","a":"Food courts"},{"q":"A microphone went to the club but forgot his ID. He couldn't get in without...?","a":"Soundproof"},{"q":"What did the drummer call his twin daughters?","a":"Tones (and a one and a two)"},{"q":"Sundays are always a little sad, but before that...?","a":"It's Saturday"},{"q":"How did the pirate buy his ship for so cheap?","a":"It was on sale"},{"q":"What is a website's favorite snack?","a":"Cookies"},{"q":"What did Captain Hook say the morning of his 80th birthday?","a":"I ain't me"},{"q":"What are a snack's political beliefs?","a":"Preservatives"},{"q":"What does Rick Ross say when doing a load of whites?","a":"I think I need bleach"},{"q":"What do you call mints for your feet?","a":"Tic tac toes"},{"q":"Why was the airplane so happy?","a":"He was in the smile high club"},{"q":"Did you hear about the alarm clock that only plays Malcolm X speeches?","a":"It's to help you stay woke"},{"q":"Did you hear about the ghost hunter twins that never find ghosts?","a":"It's a pair of normal activity"},{"q":"What did Kendrick Lamar say when he left his left arm?","a":"We gonna be all right (right-handed)"},{"q":"What did Simon say to his guest on his podcast?","a":"Why...are you gay?"}];

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

let _uid = 0;
const uid = () => String(++_uid);

const TEAM_COLORS = ["#FF6B35", "#00C8FF"];
const TEAM_NAMES_DEFAULT = ["🔥 TEAM FIRE", "❄️ TEAM ICE"];

export default function App() {
  const [screen, setScreen] = useState("home");
  const [mode, setMode] = useState("1v1");
  const [nameInput, setNameInput] = useState("");
  const [teamNameInputs, setTeamNameInputs] = useState([...TEAM_NAMES_DEFAULT]);
  const [players, setPlayers] = useState([]);
  const [deck, setDeck] = useState([]);
  const [deckIdx, setDeckIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [teller, setTeller] = useState(null);
  const [listener, setListener] = useState(null);
  const [roundNum, setRoundNum] = useState(1);
  const [lastEliminated, setLastEliminated] = useState(null);
  const [winner, setWinner] = useState(null);
  const [animKey, setAnimKey] = useState(0);
  const inputRef = useRef(null);

  const joke = deck[deckIdx % Math.max(deck.length, 1)] || { q: "Loading...", a: "..." };
  const aliveByTeam = (t) => players.filter((p) => p.team === t && p.alive);
  const totalAlive = players.filter((p) => p.alive).length;

  function addPlayer() {
    const name = nameInput.trim();
    if (!name || players.some(p => p.name.toLowerCase() === name.toLowerCase())) return;
    const autoTeam = mode === "teams" ? (players.length % 2 === 0 ? 0 : 1) : null;
    setPlayers((p) => [...p, { id: uid(), name, team: autoTeam, alive: true }]);
    setNameInput("");
    inputRef.current?.focus();
  }

  function removePlayer(id) {
    setPlayers((p) => p.filter((x) => x.id !== id));
  }

  function toggleTeam(id) {
    setPlayers((p) =>
      p.map((x) => (x.id === id ? { ...x, team: x.team === 0 ? 1 : 0 } : x))
    );
  }

  function canStart() {
    if (mode === "1v1") return players.length >= 2;
    return aliveByTeam(0).length > 0 && aliveByTeam(1).length > 0;
  }

  function startGame() {
    if (!canStart()) return;
    const d = shuffle([...JOKES]);
    const fresh = players.map((p) => ({ ...p, alive: true }));
    setPlayers(fresh);
    setDeck(d);
    setDeckIdx(0);
    setFlipped(false);
    setRoundNum(1);
    setLastEliminated(null);
    setWinner(null);
    setAnimKey((k) => k + 1);

    if (mode === "1v1") {
      setTeller(fresh[0]);
      setListener(fresh[1]);
    } else {
      setTeller(fresh.find((p) => p.team === 0));
      setListener(fresh.find((p) => p.team === 1));
    }
    setScreen("game");
  }

  function handleLaughed() {
    const updated = players.map((p) =>
      p.id === listener.id ? { ...p, alive: false } : p
    );
    setPlayers(updated);
    setLastEliminated(listener);

    if (mode === "1v1") {
      setWinner({ type: "player", name: teller.name });
      setScreen("winner");
      return;
    }

    const laughedTeam = listener.team;
    const remaining = updated.filter((p) => p.team === laughedTeam && p.alive);

    if (remaining.length === 0) {
      const winTeam = laughedTeam === 0 ? 1 : 0;
      setWinner({
        type: "team",
        teamIdx: winTeam,
        name: teamNameInputs[winTeam],
        survivors: updated.filter((p) => p.team === winTeam && p.alive),
      });
      setScreen("winner");
    } else {
      setScreen("eliminated");
    }
  }

  function nextTurn() {
    setTeller(listener);
    setListener(teller);
    setDeckIdx((i) => i + 1);
    setFlipped(false);
    setRoundNum((r) => r + 1);
    setAnimKey((k) => k + 1);
  }

  function continueAfterElimination() {
    const laughedTeam = lastEliminated.team;
    const winTeam = laughedTeam === 0 ? 1 : 0;
    const newT = players.find((p) => p.team === winTeam && p.alive);
    const newL = players.find((p) => p.team === laughedTeam && p.alive);
    setTeller(newT);
    setListener(newL);
    setDeckIdx((i) => i + 1);
    setFlipped(false);
    setRoundNum((r) => r + 1);
    setAnimKey((k) => k + 1);
    setScreen("game");
  }

  function resetGame() {
    _uid = 0;
    setScreen("home");
    setPlayers([]);
    setMode("1v1");
    setNameInput("");
    setTeamNameInputs([...TEAM_NAMES_DEFAULT]);
    setWinner(null);
    setLastEliminated(null);
  }

  // --- RENDER ---
  return (
    <div style={{ fontFamily: "'Nunito', sans-serif", background: "#0D0D12", minHeight: "100vh", color: "#fff", overflow: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bangers&family=Nunito:wght@400;600;700;800;900&display=swap');

        * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }

        .scene { perspective: 1000px; }
        .card-inner {
          transition: transform 0.55s cubic-bezier(0.4, 0, 0.2, 1);
          transform-style: preserve-3d;
          position: relative;
        }
        .card-inner.flipped { transform: rotateY(180deg); }
        .card-face {
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
          position: absolute;
          inset: 0;
          border-radius: 20px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 24px;
        }
        .card-back-face { transform: rotateY(180deg); }

        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .anim-in { animation: fadeSlideUp 0.4s ease forwards; }

        @keyframes eliminatedPulse {
          0% { transform: scale(0.8); opacity: 0; }
          60% { transform: scale(1.05); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        .elim-pop { animation: eliminatedPulse 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }

        @keyframes confettiFall {
          0% { transform: translateY(-20px) rotate(0deg); opacity: 1; }
          100% { transform: translateY(110vh) rotate(720deg); opacity: 0; }
        }
        .confetti { position: fixed; pointer-events: none; z-index: 999; }

        @keyframes winnerBounce {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-12px) scale(1.02); }
        }
        .winner-bounce { animation: winnerBounce 1.8s ease-in-out infinite; }

        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        .shimmer-text {
          background: linear-gradient(90deg, #FFE500, #FF6B35, #FFE500, #00C8FF, #FFE500);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 3s linear infinite;
        }

        .btn-press {
          transition: transform 0.1s, box-shadow 0.1s;
          cursor: pointer;
        }
        .btn-press:active { transform: translateY(3px); }

        .scrollable { overflow-y: auto; -webkit-overflow-scrolling: touch; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #333; border-radius: 2px; }
      `}</style>

      <Confetti active={screen === "winner"} />

      {/* HOME */}
      {screen === "home" && (
        <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px 20px", background: "radial-gradient(ellipse at 50% 0%, #1a1a2e 0%, #0D0D12 60%)" }}>
          <div className="anim-in" style={{ textAlign: "center", maxWidth: 420, width: "100%" }}>
            {/* Logo */}
            <div style={{ fontSize: 72, marginBottom: 4, lineHeight: 1 }}>🃏</div>
            <h1 style={{ fontFamily: "'Bangers', cursive", fontSize: "clamp(60px, 15vw, 96px)", lineHeight: 0.9, letterSpacing: "0.04em", margin: "0 0 8px", color: "#FFE500", textShadow: "4px 4px 0px #FF6B35, 8px 8px 0px rgba(255,107,53,0.3)" }}>
              DAD JOKES
            </h1>
            <p style={{ fontSize: 16, color: "#888", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 48 }}>
              Who's got the best poker face?
            </p>

            {/* Mode Select */}
            <p style={{ fontSize: 13, fontWeight: 700, color: "#555", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 12 }}>SELECT MODE</p>
            <div style={{ display: "flex", gap: 12, marginBottom: 32 }}>
              {[["1v1", "⚔️", "Two players, head-to-head"], ["teams", "🏆", "Build teams, last one standing"]].map(([m, emoji, desc]) => (
                <button
                  key={m}
                  className="btn-press"
                  onClick={() => setMode(m)}
                  style={{
                    flex: 1, padding: "16px 12px", borderRadius: 16, border: `2px solid ${mode === m ? "#FFE500" : "#222"}`,
                    background: mode === m ? "rgba(255,229,0,0.1)" : "#111",
                    color: mode === m ? "#FFE500" : "#666", cursor: "pointer", textAlign: "center",
                    boxShadow: mode === m ? "0 0 20px rgba(255,229,0,0.2)" : "none",
                    transition: "all 0.2s",
                  }}
                >
                  <div style={{ fontSize: 28, marginBottom: 6 }}>{emoji}</div>
                  <div style={{ fontFamily: "'Bangers', cursive", fontSize: 22, letterSpacing: "0.05em" }}>
                    {m === "1v1" ? "1 VS 1" : "TEAMS"}
                  </div>
                  <div style={{ fontSize: 11, marginTop: 4, color: mode === m ? "#aaa" : "#444" }}>{desc}</div>
                </button>
              ))}
            </div>

            <button
              className="btn-press"
              onClick={() => setScreen("lobby")}
              style={{
                width: "100%", padding: "18px", borderRadius: 16, border: "none",
                background: "linear-gradient(135deg, #FFE500, #FF6B35)",
                color: "#000", fontFamily: "'Bangers', cursive", fontSize: 28,
                letterSpacing: "0.08em", cursor: "pointer",
                boxShadow: "0 8px 32px rgba(255,229,0,0.35)",
              }}
            >
              LET'S PLAY 🎉
            </button>

            <p style={{ marginTop: 16, fontSize: 12, color: "#333" }}>
              {JOKES.length} jokes loaded • Mobile optimized
            </p>
          </div>
        </div>
      )}

      {/* LOBBY */}
      {screen === "lobby" && (
        <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", maxWidth: 480, margin: "0 auto", padding: "0 0 100px" }}>
          {/* Header */}
          <div style={{ padding: "20px 20px 0", display: "flex", alignItems: "center", gap: 12 }}>
            <button onClick={() => setScreen("home")} style={{ background: "#1a1a1a", border: "none", color: "#888", width: 40, height: 40, borderRadius: 10, fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>←</button>
            <div>
              <h2 style={{ fontFamily: "'Bangers', cursive", fontSize: 28, letterSpacing: "0.05em", margin: 0, lineHeight: 1 }}>ADD PLAYERS</h2>
              <p style={{ margin: 0, fontSize: 12, color: "#555" }}>{mode === "1v1" ? "Add exactly 2 players" : "Add players — tap to assign teams"}</p>
            </div>
          </div>

          {/* Team name editors (teams mode only) */}
          {mode === "teams" && (
            <div style={{ padding: "16px 20px 0", display: "flex", gap: 10 }}>
              {[0, 1].map((t) => (
                <div key={t} style={{ flex: 1 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", color: TEAM_COLORS[t], marginBottom: 4, textTransform: "uppercase" }}>Team {t + 1} Name</div>
                  <input
                    value={teamNameInputs[t]}
                    onChange={(e) => setTeamNameInputs((n) => n.map((v, i) => i === t ? e.target.value : v))}
                    maxLength={16}
                    style={{
                      width: "100%", padding: "10px 12px", borderRadius: 10, border: `2px solid ${TEAM_COLORS[t]}44`,
                      background: "#111", color: "#fff", fontSize: 14, fontWeight: 700, outline: "none",
                    }}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Add player input */}
          <div style={{ padding: "16px 20px 0", display: "flex", gap: 10 }}>
            <input
              ref={inputRef}
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addPlayer()}
              placeholder="Enter player name..."
              maxLength={20}
              style={{
                flex: 1, padding: "14px 16px", borderRadius: 12, border: "2px solid #222",
                background: "#111", color: "#fff", fontSize: 16, outline: "none",
              }}
            />
            <button
              className="btn-press"
              onClick={addPlayer}
              style={{
                padding: "0 20px", borderRadius: 12, border: "none",
                background: nameInput.trim() ? "#FFE500" : "#222",
                color: nameInput.trim() ? "#000" : "#555",
                fontFamily: "'Bangers', cursive", fontSize: 20, letterSpacing: "0.05em",
                cursor: nameInput.trim() ? "pointer" : "default", transition: "all 0.15s",
              }}
            >
              ADD
            </button>
          </div>

          {/* Player list */}
          <div className="scrollable" style={{ flex: 1, padding: "16px 20px 0" }}>
            {players.length === 0 && (
              <div style={{ textAlign: "center", padding: "40px 20px", color: "#333" }}>
                <div style={{ fontSize: 48 }}>👥</div>
                <p style={{ marginTop: 8, fontSize: 14 }}>No players yet. Add some above!</p>
              </div>
            )}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {players.map((p, i) => (
                <div
                  key={p.id}
                  className="anim-in"
                  style={{
                    display: "flex", alignItems: "center", gap: 12, padding: "14px 16px",
                    background: "#111", borderRadius: 14,
                    border: mode === "teams" ? `2px solid ${TEAM_COLORS[p.team ?? 0]}44` : "2px solid #1e1e1e",
                  }}
                >
                  <div style={{
                    width: 36, height: 36, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center",
                    fontFamily: "'Bangers', cursive", fontSize: 18, letterSpacing: "0.05em",
                    background: mode === "teams" ? `${TEAM_COLORS[p.team ?? 0]}22` : "#1a1a1a",
                    color: mode === "teams" ? TEAM_COLORS[p.team ?? 0] : "#FFE500",
                    border: mode === "teams" ? `2px solid ${TEAM_COLORS[p.team ?? 0]}66` : "2px solid #2a2a2a",
                  }}>
                    {i + 1}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 800, fontSize: 15 }}>{p.name}</div>
                    {mode === "teams" && (
                      <div style={{ fontSize: 11, color: TEAM_COLORS[p.team ?? 0], fontWeight: 700 }}>
                        {teamNameInputs[p.team ?? 0]}
                      </div>
                    )}
                  </div>
                  {mode === "teams" && (
                    <button
                      className="btn-press"
                      onClick={() => toggleTeam(p.id)}
                      style={{
                        padding: "6px 12px", borderRadius: 8, border: `2px solid ${TEAM_COLORS[p.team ?? 0]}`,
                        background: "transparent", color: TEAM_COLORS[p.team ?? 0],
                        fontSize: 11, fontWeight: 800, cursor: "pointer", letterSpacing: "0.05em",
                      }}
                    >
                      SWITCH
                    </button>
                  )}
                  <button
                    onClick={() => removePlayer(p.id)}
                    style={{ background: "none", border: "none", color: "#444", fontSize: 18, cursor: "pointer", padding: "4px 8px" }}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>

            {/* Team summary for teams mode */}
            {mode === "teams" && players.length > 0 && (
              <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
                {[0, 1].map((t) => {
                  const count = players.filter(p => p.team === t).length;
                  return (
                    <div key={t} style={{ flex: 1, padding: "12px", background: `${TEAM_COLORS[t]}11`, borderRadius: 12, border: `2px solid ${TEAM_COLORS[t]}33`, textAlign: "center" }}>
                      <div style={{ fontSize: 20, fontFamily: "'Bangers'", color: TEAM_COLORS[t], letterSpacing: "0.03em" }}>{count}</div>
                      <div style={{ fontSize: 11, color: TEAM_COLORS[t], fontWeight: 700 }}>PLAYERS</div>
                      <div style={{ fontSize: 11, color: "#444", marginTop: 2 }}>{teamNameInputs[t]}</div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Start button */}
          <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 480, padding: "16px 20px", background: "linear-gradient(to top, #0D0D12 60%, transparent)" }}>
            <button
              className="btn-press"
              onClick={startGame}
              disabled={!canStart()}
              style={{
                width: "100%", padding: "18px", borderRadius: 16, border: "none",
                background: canStart() ? "linear-gradient(135deg, #FFE500, #FF6B35)" : "#1a1a1a",
                color: canStart() ? "#000" : "#333",
                fontFamily: "'Bangers', cursive", fontSize: 26, letterSpacing: "0.08em",
                cursor: canStart() ? "pointer" : "default",
                boxShadow: canStart() ? "0 8px 32px rgba(255,229,0,0.3)" : "none",
                transition: "all 0.2s",
              }}
            >
              {canStart() ? "START GAME 🎮" : mode === "1v1" ? `NEED ${2 - players.length} MORE PLAYER${players.length === 1 ? "" : "S"}` : "NEED PLAYERS ON EACH TEAM"}
            </button>
          </div>
        </div>
      )}

      {/* GAME */}
      {screen === "game" && teller && listener && (
        <div key={animKey} style={{ minHeight: "100vh", display: "flex", flexDirection: "column", maxWidth: 480, margin: "0 auto", padding: "0 0 20px" }}>
          {/* Top bar */}
          <div style={{ padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ background: "#1a1a1a", padding: "6px 14px", borderRadius: 10, fontSize: 13, fontFamily: "'Bangers'", letterSpacing: "0.08em", color: "#888" }}>
              ROUND {roundNum}
            </div>
            {mode === "teams" && (
              <div style={{ display: "flex", gap: 8 }}>
                {[0, 1].map((t) => (
                  <div key={t} style={{ display: "flex", alignItems: "center", gap: 5, background: "#111", padding: "5px 10px", borderRadius: 8, border: `1.5px solid ${TEAM_COLORS[t]}44` }}>
                    <div style={{ width: 7, height: 7, borderRadius: "50%", background: TEAM_COLORS[t] }} />
                    <span style={{ fontSize: 12, fontWeight: 800, color: TEAM_COLORS[t] }}>{aliveByTeam(t).length}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* VS Header */}
          <div className="anim-in" style={{ padding: "0 20px 0" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#111", borderRadius: 16, padding: "14px 16px", border: "2px solid #1e1e1e" }}>
              <PlayerBadge player={teller} label="TELLING" color={mode === "teams" ? TEAM_COLORS[teller.team ?? 0] : "#FFE500"} />
              <div style={{ fontFamily: "'Bangers'", fontSize: 22, color: "#333", letterSpacing: "0.05em", flexShrink: 0 }}>VS</div>
              <PlayerBadge player={listener} label="LISTENING" color={mode === "teams" ? TEAM_COLORS[listener.team ?? 0] : "#FF6B35"} right />
            </div>
          </div>

          {/* Instruction */}
          <div className="anim-in" style={{ padding: "12px 20px 0", textAlign: "center" }}>
            <div style={{ fontSize: 13, color: "#555", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>
              <span style={{ color: "#FFE500" }}>{teller.name}</span> reads the joke •{" "}
              <span style={{ color: "#FF6B35" }}>{listener.name}</span> tries not to laugh
            </div>
          </div>

          {/* Card */}
          <div style={{ flex: 1, padding: "16px 20px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <div className="scene" style={{ height: 260 }} onClick={() => setFlipped(!flipped)}>
              <div className={`card-inner ${flipped ? "flipped" : ""}`} style={{ height: 260 }}>
                {/* Front - Question */}
                <div className="card-face" style={{ background: "#fff", cursor: "pointer" }}>
                  <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.15em", color: "#aaa", textTransform: "uppercase", marginBottom: 16 }}>
                    THE SETUP
                  </div>
                  <div style={{ fontSize: "clamp(18px, 5vw, 22px)", fontWeight: 800, color: "#111", textAlign: "center", lineHeight: 1.4, maxWidth: 300 }}>
                    {joke.q}
                  </div>
                  <div style={{ marginTop: 20, display: "flex", alignItems: "center", gap: 6, color: "#bbb", fontSize: 13 }}>
                    <span>Tap to reveal answer</span>
                    <span>👆</span>
                  </div>
                </div>
                {/* Back - Answer */}
                <div className="card-face card-back-face" style={{ background: "#FFE500", cursor: "pointer" }}>
                  <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.15em", color: "#666", textTransform: "uppercase", marginBottom: 16 }}>
                    THE PUNCHLINE
                  </div>
                  <div style={{ fontSize: "clamp(20px, 6vw, 26px)", fontWeight: 900, color: "#111", textAlign: "center", lineHeight: 1.3, maxWidth: 300 }}>
                    {joke.a}
                  </div>
                  <div style={{ marginTop: 20, fontSize: 32 }}>🥁</div>
                </div>
              </div>
            </div>

            {/* Flip hint */}
            {!flipped && (
              <div style={{ textAlign: "center", marginTop: 8, fontSize: 12, color: "#333", fontWeight: 600 }}>
                {teller.name.toUpperCase()}: tap the card to see the punchline
              </div>
            )}
          </div>

          {/* Host Controls */}
          <div style={{ padding: "0 20px" }}>
            <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.12em", color: "#333", textAlign: "center", textTransform: "uppercase", marginBottom: 10 }}>
              🎙️ REF CONTROLS
            </div>
            <button
              className="btn-press"
              onClick={handleLaughed}
              style={{
                width: "100%", padding: "18px", borderRadius: 16, border: "2px solid #FF3333",
                background: "linear-gradient(135deg, #FF2B2B, #FF6B35)",
                color: "#fff", fontFamily: "'Bangers', cursive", fontSize: 24,
                letterSpacing: "0.06em", cursor: "pointer",
                boxShadow: "0 6px 24px rgba(255,43,43,0.35)",
                marginBottom: 10,
              }}
            >
              😂 {listener.name.toUpperCase()} LAUGHED!
            </button>
            <button
              className="btn-press"
              onClick={nextTurn}
              style={{
                width: "100%", padding: "14px", borderRadius: 14, border: "2px solid #1e1e1e",
                background: "#111", color: "#666",
                fontFamily: "'Bangers', cursive", fontSize: 18,
                letterSpacing: "0.06em", cursor: "pointer",
              }}
            >
              NO LAUGH → {listener.name.toUpperCase()}'S TURN
            </button>
          </div>
        </div>
      )}

      {/* ELIMINATED */}
      {screen === "eliminated" && lastEliminated && (
        <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24, background: "#0a0003", textAlign: "center" }}>
          <div className="elim-pop">
            <div style={{ fontSize: 80, marginBottom: 8 }}>💀</div>
            <h2 style={{ fontFamily: "'Bangers', cursive", fontSize: 56, letterSpacing: "0.05em", color: "#FF2B2B", margin: "0 0 8px", textShadow: "0 0 40px rgba(255,43,43,0.5)" }}>
              ELIMINATED
            </h2>
            <div style={{ fontFamily: "'Bangers', cursive", fontSize: 36, color: "#fff", letterSpacing: "0.04em", marginBottom: 8 }}>
              {lastEliminated.name}
            </div>
            {mode === "teams" && (
              <div style={{ fontSize: 14, color: TEAM_COLORS[lastEliminated.team ?? 0], fontWeight: 700, marginBottom: 24, letterSpacing: "0.05em" }}>
                {teamNameInputs[lastEliminated.team ?? 0]}
              </div>
            )}
            <div style={{ fontSize: 15, color: "#555", marginBottom: 40 }}>
              They couldn't hold back the laugh 😂
            </div>

            {/* Surviving team count */}
            {mode === "teams" && (
              <div style={{ display: "flex", gap: 16, marginBottom: 40 }}>
                {[0, 1].map((t) => {
                  const cnt = players.filter(p => p.team === t && p.alive).length;
                  return (
                    <div key={t} style={{ textAlign: "center", background: `${TEAM_COLORS[t]}11`, padding: "12px 20px", borderRadius: 14, border: `2px solid ${TEAM_COLORS[t]}44` }}>
                      <div style={{ fontFamily: "'Bangers'", fontSize: 32, color: TEAM_COLORS[t] }}>{cnt}</div>
                      <div style={{ fontSize: 11, color: TEAM_COLORS[t], fontWeight: 700 }}>LEFT</div>
                      <div style={{ fontSize: 11, color: "#444", marginTop: 2 }}>{teamNameInputs[t]}</div>
                    </div>
                  );
                })}
              </div>
            )}

            <button
              className="btn-press"
              onClick={continueAfterElimination}
              style={{
                padding: "16px 48px", borderRadius: 14, border: "none",
                background: "linear-gradient(135deg, #FFE500, #FF6B35)",
                color: "#000", fontFamily: "'Bangers', cursive", fontSize: 22,
                letterSpacing: "0.08em", cursor: "pointer",
                boxShadow: "0 8px 32px rgba(255,229,0,0.3)",
              }}
            >
              NEXT ROUND →
            </button>
          </div>
        </div>
      )}

      {/* WINNER */}
      {screen === "winner" && winner && (
        <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24, background: "radial-gradient(ellipse at 50% 50%, #0f1a00 0%, #0D0D12 70%)", textAlign: "center" }}>
          <div className="winner-bounce" style={{ maxWidth: 400, width: "100%" }}>
            <div style={{ fontSize: 80, marginBottom: 8 }}>🏆</div>
            <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: "0.2em", color: "#888", textTransform: "uppercase", marginBottom: 8 }}>
              GAME OVER
            </div>
            <h2 className="shimmer-text" style={{ fontFamily: "'Bangers', cursive", fontSize: "clamp(48px, 12vw, 72px)", letterSpacing: "0.05em", margin: "0 0 8px", lineHeight: 0.95 }}>
              {winner.name.toUpperCase()}
            </h2>
            <div style={{ fontSize: 22, fontFamily: "'Bangers'", letterSpacing: "0.05em", color: "#00FF87", marginBottom: 8 }}>
              {winner.type === "team" ? "WINS THE GAME!" : "IS UNDEFEATED!"}
            </div>

            {winner.type === "team" && winner.survivors && (
              <div style={{ marginTop: 16, marginBottom: 24 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#555", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 10 }}>SURVIVED</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center" }}>
                  {winner.survivors.map((p) => (
                    <div key={p.id} style={{ background: `${TEAM_COLORS[winner.teamIdx]}22`, border: `2px solid ${TEAM_COLORS[winner.teamIdx]}`, padding: "6px 14px", borderRadius: 10, color: TEAM_COLORS[winner.teamIdx], fontWeight: 800, fontSize: 13 }}>
                      {p.name}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div style={{ marginTop: winner.type === "team" ? 0 : 32, display: "flex", flexDirection: "column", gap: 12, alignItems: "center" }}>
              <button
                className="btn-press"
                onClick={startGame}
                style={{
                  padding: "16px 40px", borderRadius: 14, border: "none",
                  background: "linear-gradient(135deg, #FFE500, #FF6B35)",
                  color: "#000", fontFamily: "'Bangers', cursive", fontSize: 22,
                  letterSpacing: "0.08em", cursor: "pointer",
                  boxShadow: "0 8px 32px rgba(255,229,0,0.3)",
                }}
              >
                REMATCH 🔁
              </button>
              <button
                className="btn-press"
                onClick={resetGame}
                style={{
                  padding: "12px 32px", borderRadius: 12, border: "2px solid #1e1e1e",
                  background: "transparent", color: "#555", fontFamily: "'Bangers', cursive",
                  fontSize: 18, letterSpacing: "0.06em", cursor: "pointer",
                }}
              >
                NEW GAME
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function PlayerBadge({ player, label, color, right }) {
  return (
    <div style={{ flex: 1, textAlign: right ? "right" : "left" }}>
      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", color: color, textTransform: "uppercase", marginBottom: 2 }}>
        {label}
      </div>
      <div style={{ fontFamily: "'Bangers', cursive", fontSize: "clamp(16px, 4.5vw, 20px)", letterSpacing: "0.03em", color: "#fff", lineHeight: 1.1 }}>
        {player.name}
      </div>
    </div>
  );
}

function Confetti({ active }) {
  const [pieces, setPieces] = useState([]);
  useEffect(() => {
    if (!active) { setPieces([]); return; }
    const colors = ["#FFE500", "#FF6B35", "#00C8FF", "#FF2B2B", "#00FF87", "#FF69B4"];
    const shapes = ["■", "●", "▲", "★"];
    setPieces(
      Array.from({ length: 60 }, (_, i) => ({
        id: i,
        color: colors[i % colors.length],
        shape: shapes[i % shapes.length],
        left: Math.random() * 100,
        delay: Math.random() * 3,
        duration: 2.5 + Math.random() * 2,
        size: 8 + Math.random() * 10,
      }))
    );
  }, [active]);

  if (!active || pieces.length === 0) return null;
  return (
    <>
      {pieces.map((p) => (
        <div
          key={p.id}
          className="confetti"
          style={{
            left: `${p.left}%`,
            top: -20,
            color: p.color,
            fontSize: p.size,
            animation: `confettiFall ${p.duration}s ${p.delay}s linear infinite`,
          }}
        >
          {p.shape}
        </div>
      ))}
    </>
  );
}
