export default function Home() {
  return (
    //Use className for adding classes to certain elements
    //Reason: class is a keyword in Javascript
    <div className="home-intro">
      <h1 class = "text-lg font-bold text-center">Clean The Streets</h1>
      <h3 class = "text-center mb-5">Our Mission</h3>
      <p class = "text-sm text-center">
        At CleanTheStreets, we believe every voice matters in creating safer,
        smoother roads for our communities. Our mission is to empower citizens
        across the United States to report potholes and road hazards, ensuring
        that your input drives real change. Together, we can pave the way for a
        safer, more efficient transportation system for everyone.
      </p>
    </div>
  );
}
