
public void setup(){
  size(500, 500);
  frameRate(15);
  textAlign(CENTER, CENTER);
  textSize(tWidth - 15);
}

float tWidth = 64;
float xO = 0;
float yO = 0;

public void draw(){
  background(150);
  stroke(255, 0, 0);
  noFill();
  strokeWeight(5);
  rect(50, 50, 400, 400);
  for(int xi = 0; xi < 400.0f / tWidth + 1; xi++){
    for(int yi = 0; yi < 400.0f / tWidth + 1; yi++){
      drawTile(xi * tWidth - (xO % tWidth), yi * tWidth - (yO % tWidth), int(xi + xO / tWidth), int(yi + yO / tWidth));
    }
  }
  xO+=0.5;
}

void drawTile(float x, float y, int xID, int yID){
  rect(x + 50, y + 50, tWidth, tWidth);
  text(xID, x + 50 + tWidth / 2, y + 50 + tWidth / 2);
  
}
