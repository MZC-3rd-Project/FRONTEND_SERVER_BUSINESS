import { Link } from "react-router";
import { Button } from "../ui/button";

export function AuthButtons() {
    return (
        <div className="flex items-center gap-4">
            <Button variant="secondary" asChild>
                <Link to="/auth/login">Login</Link>
            </Button>
            <Button asChild>
                <Link to="/auth/join">Join</Link>
            </Button>
        </div>
    );
}