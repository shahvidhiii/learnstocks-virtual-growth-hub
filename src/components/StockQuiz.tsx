
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Quiz, QuizQuestion } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface StockQuizProps {
  quiz: Quiz;
  onComplete: (score: number) => void;
}

const StockQuiz = ({ quiz, onComplete }: StockQuizProps) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [answeredCorrectly, setAnsweredCorrectly] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const { user } = useAuth();
  
  const currentQuestion = quiz.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;
  
  // Check if this is the daily basics quiz
  const isDailyBasics = quiz.id === "basics";
  const today = new Date().toDateString();
  const completedToday = localStorage.getItem(`quiz_completed_basics_${today}`) === "true";
  
  const handleSelectOption = (index: number) => {
    if (answeredCorrectly !== null) return; // Don't allow changing after answering
    setSelectedOption(index);
  };
  
  const handleCheckAnswer = () => {
    if (selectedOption === null) return;
    
    const isCorrect = selectedOption === currentQuestion.correctOption;
    setAnsweredCorrectly(isCorrect);
    
    if (isCorrect) {
      setScore(score + 1);
    }
  };
  
  const handleNextQuestion = () => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedOption(null);
      setAnsweredCorrectly(null);
    } else {
      const finalScore = score + (answeredCorrectly ? 1 : 0);
      setQuizCompleted(true);
      processQuizCompletion(finalScore);
    }
  };
  
  const processQuizCompletion = async (finalScore: number) => {
    const calculatedScore = calculateFinalScore(finalScore);
    setIsProcessing(true);
    
    try {
      // Mark daily quiz as completed
      if (isDailyBasics) {
        localStorage.setItem(`quiz_completed_basics_${today}`, "true");
      }
      
      // Update the user's points in the database using the RPC function
      if (user) {
        const { data, error } = await supabase.rpc('increment_points', {
          amount: calculatedScore.points
        });
          
        if (error) {
          console.error("Error updating points:", error);
          toast.error("Failed to add points to your account");
        } else {
          toast.success(`${calculatedScore.points} points added to your account!`);
        }
      }
    } catch (err) {
      console.error("Error processing quiz completion:", err);
      toast.error("Failed to process quiz results");
    } finally {
      setIsProcessing(false);
      onComplete(finalScore);
    }
  };
  
  const calculateFinalScore = (totalScore: number) => {
    const percentage = (totalScore / quiz.questions.length) * 100;
    return {
      correct: totalScore,
      total: quiz.questions.length,
      percentage: percentage.toFixed(0),
      points: Math.round((percentage / 100) * quiz.points)
    };
  };
  
  return (
    <Card className="w-full">
      {!quizCompleted ? (
        <>
          <CardHeader>
            <CardTitle>{quiz.title}</CardTitle>
            {isDailyBasics && (
              <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-2">
                <p className="text-sm text-blue-700">
                  🌟 Daily Challenge: 5 questions selected just for you today!
                </p>
              </div>
            )}
            <div className="flex justify-between items-center">
              <span className="text-sm">Question {currentQuestionIndex + 1} of {quiz.questions.length}</span>
              <span className="text-sm">Score: {score}</span>
            </div>
            <Progress value={progress} className="mt-2" />
          </CardHeader>
          
          <CardContent>
            <div className="space-y-4">
              <h3 className="font-medium text-lg">{currentQuestion.text}</h3>
              
              <RadioGroup value={selectedOption?.toString()} className="space-y-2">
                {currentQuestion.options.map((option, index) => (
                  <div
                    key={index}
                    className={cn(
                      "flex items-center space-x-2 border p-3 rounded-md cursor-pointer",
                      selectedOption === index && answeredCorrectly === null && "border-learngreen-400 bg-learngreen-50",
                      answeredCorrectly !== null && index === currentQuestion.correctOption && "border-green-400 bg-green-50",
                      answeredCorrectly === false && selectedOption === index && "border-red-400 bg-red-50"
                    )}
                    onClick={() => handleSelectOption(index)}
                  >
                    <RadioGroupItem 
                      value={index.toString()} 
                      checked={selectedOption === index}
                      id={`option-${index}`}
                    />
                    <Label htmlFor={`option-${index}`} className="font-normal flex-1 cursor-pointer">
                      {option}
                    </Label>
                    {answeredCorrectly !== null && index === currentQuestion.correctOption && (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    )}
                    {answeredCorrectly === false && selectedOption === index && (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                  </div>
                ))}
              </RadioGroup>
              
              {answeredCorrectly !== null && (
                <div className={cn(
                  "p-3 rounded-md",
                  answeredCorrectly ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
                )}>
                  <p className="font-medium mb-1">
                    {answeredCorrectly ? "Correct!" : "Incorrect!"}
                  </p>
                  <p className="text-sm">{currentQuestion.explanation}</p>
                </div>
              )}
            </div>
          </CardContent>
          
          <CardFooter className="flex justify-end space-x-4">
            {answeredCorrectly === null ? (
              <Button 
                onClick={handleCheckAnswer}
                className="bg-learngreen-600 hover:bg-learngreen-700"
                disabled={selectedOption === null}
              >
                Check Answer
              </Button>
            ) : (
              <Button 
                onClick={handleNextQuestion}
                className="bg-learngreen-600 hover:bg-learngreen-700"
              >
                {currentQuestionIndex < quiz.questions.length - 1 ? "Next Question" : "Finish Quiz"}
              </Button>
            )}
          </CardFooter>
        </>
      ) : (
        <>
          <CardHeader>
            <CardTitle>Quiz Completed!</CardTitle>
          </CardHeader>
          
          <CardContent>
            <div className="text-center space-y-4">
              <div className="mb-4">
                <div className="text-6xl font-bold text-learngreen-600 mb-2">
                  {calculateFinalScore(score + (answeredCorrectly ? 1 : 0)).percentage}%
                </div>
                <p className="text-xl">
                  You got {score + (answeredCorrectly ? 1 : 0)} out of {quiz.questions.length} questions right
                </p>
              </div>
              
              <div className="p-4 bg-learngreen-50 rounded-md">
                <p className="font-medium text-learngreen-700">
                  You earned {calculateFinalScore(score + (answeredCorrectly ? 1 : 0)).points} points!
                </p>
                {isDailyBasics && (
                  <p className="text-sm text-learngreen-600 mt-1">
                    Come back tomorrow for 5 new questions! 📅
                  </p>
                )}
              </div>
            </div>
          </CardContent>
          
          <CardFooter className="flex justify-center">
            <Button 
              onClick={() => window.location.reload()}
              variant="outline"
              className="mr-2"
              disabled={isProcessing}
            >
              Try Again
            </Button>
            <Button
              className="bg-learngreen-600 hover:bg-learngreen-700"
              onClick={() => window.location.href = '/games'}
              disabled={isProcessing}
            >
              Back to Games
            </Button>
          </CardFooter>
        </>
      )}
    </Card>
  );
};

export default StockQuiz;
